<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AuthUser;
use RuntimeException;

final class GameStateService
{
    public function __construct(
        private readonly string $gameSlug,
        private readonly string $gameName
    ) {
    }

    public function initialState(): array
    {
        $player = [
            'chassis' => 0,
            'weapons' => 0,
            'armor' => 0,
            'engines' => 0,
            'ownedParts' => [
                'chassis' => [0],
                'weapons' => [0],
                'armor' => [0],
                'engines' => [0],
            ],
        ];

        return [
            'game_slug' => $this->gameSlug,
            'game_name' => $this->gameName,
            'schema_version' => 2,
            'gold' => 100,
            'wins' => 0,
            'player' => $player,
            'playerStats' => $this->playerStats($player),
            'combat' => $this->emptyCombat(),
            'lastBattleResult' => null,
            'created_at' => gmdate('Y-m-d H:i:s'),
        ];
    }

    public function applyIntent(array $state, string $intent, array $payload): array
    {
        $state = $this->withDefaults($state);

        return match ($intent) {
            'initialize', 'load' => $state,
            'add_gold' => $this->addGold($state, $payload),
            'spend_gold' => $this->spendGoldIntent($state, $payload),
            'add_win' => $this->addWin($state),
            'buy_part' => $this->buyPart($state, $payload),
            'equip_part' => $this->equipPart($state, $payload),
            'reset_game' => $this->initialState(),
            'start_battle' => $this->startBattle($state, $payload),
            'end_battle' => $this->endBattle($state, $payload),
            'player_attack' => $this->playerDamageAction($state, 'attack'),
            'player_special' => $this->playerDamageAction($state, 'special'),
            'player_defend' => $this->playerDefend($state),
            'enemy_turn' => $this->enemyTurn($state),
            'reset_combat' => $this->resetCombat($state),
            default => throw new RuntimeException('Unsupported game intent: ' . $intent),
        };
    }

    public function response(array $save, AuthUser $user): array
    {
        return [
            'user' => $user->toArray(),
            'save' => [
                'id' => $save['id'],
                'slot' => $save['save_slot'],
                'state' => $this->withDefaults($save['state']),
                'metadata' => $save['metadata'],
                'version' => $save['version'],
                'status' => $save['status'],
                'created_at' => $save['created_at'],
                'updated_at' => $save['updated_at'],
            ],
        ];
    }

    private function addGold(array $state, array $payload): array
    {
        $state['gold'] = (int) $state['gold'] + (int) $this->number($payload['amount'] ?? 0, 'amount');
        return $state;
    }

    private function spendGoldIntent(array $state, array $payload): array
    {
        return $this->spendGold($state, (int) $this->number($payload['amount'] ?? 0, 'amount'));
    }

    private function addWin(array $state): array
    {
        $state['wins'] = (int) $state['wins'] + 1;
        return $state;
    }

    private function buyPart(array $state, array $payload): array
    {
        [$category, $index] = $this->partRef($payload);
        $part = $this->part($category, $index);
        if (in_array($index, $state['player']['ownedParts'][$category], true)) {
            return $state;
        }

        $state = $this->spendGold($state, (int) $part['cost']);
        $state['player']['ownedParts'][$category][] = $index;
        return $state;
    }

    private function equipPart(array $state, array $payload): array
    {
        [$category, $index] = $this->partRef($payload);
        $this->part($category, $index);
        if (!in_array($index, $state['player']['ownedParts'][$category], true)) {
            throw new RuntimeException('Part is not owned.');
        }

        $state['player'][$category] = $index;
        $state['playerStats'] = $this->playerStats($state['player']);
        return $state;
    }

    private function startBattle(array $state, array $payload): array
    {
        $enemy = $payload['enemy'] ?? null;
        if (!is_array($enemy) || !isset($enemy['name'], $enemy['health'], $enemy['attack'], $enemy['defense'])) {
            throw new RuntimeException('Enemy payload is required.');
        }

        $stats = $this->playerStats($state['player']);
        $state['combat'] = [
            'playerHealth' => $stats['health'],
            'playerMaxHealth' => $stats['health'],
            'enemyHealth' => (int) $enemy['health'],
            'enemyMaxHealth' => (int) $enemy['health'],
            'currentEnemy' => $enemy,
            'turn' => 'player',
            'battleLog' => [
                ['message' => 'Battle started against ' . (string) $enemy['name'] . '!', 'type' => 'info'],
            ],
            'isActive' => true,
            'lastDamageResult' => null,
        ];
        $state['lastBattleResult'] = null;
        return $state;
    }

    private function endBattle(array $state, array $payload): array
    {
        $victory = ($payload['victory'] ?? false) === true;
        $goldEarned = $victory && is_array($state['combat']['currentEnemy'])
            ? (int) $state['combat']['currentEnemy']['gold']
            : 0;

        if ($victory) {
            $state['gold'] = (int) $state['gold'] + $goldEarned;
            $state['wins'] = (int) $state['wins'] + 1;
        }

        $state['combat']['isActive'] = false;
        $state['combat']['turn'] = 'player';
        $state['lastBattleResult'] = ['victory' => $victory, 'goldEarned' => $goldEarned];
        return $state;
    }

    private function playerDamageAction(array $state, string $action): array
    {
        $combat = $state['combat'];
        if ($combat['turn'] !== 'player' || !$combat['isActive'] || !is_array($combat['currentEnemy'])) {
            throw new RuntimeException('It is not the player turn.');
        }

        $stats = $this->playerStats($state['player']);
        $baseAttack = $action === 'special' ? (int) floor($stats['attack'] * 1.5) : $stats['attack'];
        $result = $this->damage($baseAttack, (int) $combat['currentEnemy']['defense']);
        $newEnemyHealth = max(0, (int) $combat['enemyHealth'] - $result['damage']);
        $prefix = $action === 'special' ? 'Special attack! ' : ($result['critical'] ? 'Critical hit! ' : '');

        $state['combat']['enemyHealth'] = $newEnemyHealth;
        $state['combat']['turn'] = $newEnemyHealth <= 0 ? 'player' : 'enemy';
        $state['combat']['lastDamageResult'] = $result;
        $state['combat']['battleLog'][] = [
            'message' => $prefix . 'You dealt ' . $result['damage'] . ' damage to ' . (string) $combat['currentEnemy']['name'] . '!',
            'type' => 'damage',
        ];
        return $state;
    }

    private function playerDefend(array $state): array
    {
        if ($state['combat']['turn'] !== 'player' || !$state['combat']['isActive']) {
            throw new RuntimeException('It is not the player turn.');
        }

        $healAmount = (int) floor((int) $state['combat']['playerMaxHealth'] * 0.1);
        $state['combat']['playerHealth'] = min((int) $state['combat']['playerMaxHealth'], (int) $state['combat']['playerHealth'] + $healAmount);
        $state['combat']['turn'] = 'enemy';
        $state['combat']['battleLog'][] = [
            'message' => 'You defended and recovered ' . $healAmount . ' health!',
            'type' => 'healing',
        ];
        return $state;
    }

    private function enemyTurn(array $state): array
    {
        $combat = $state['combat'];
        if ($combat['turn'] !== 'enemy' || !$combat['isActive'] || !is_array($combat['currentEnemy'])) {
            throw new RuntimeException('It is not the enemy turn.');
        }

        $stats = $this->playerStats($state['player']);
        $result = $this->damage((int) $combat['currentEnemy']['attack'], $stats['defense']);
        $newPlayerHealth = max(0, (int) $combat['playerHealth'] - $result['damage']);
        $prefix = $result['critical'] ? 'Critical hit! ' : '';

        $state['combat']['playerHealth'] = $newPlayerHealth;
        $state['combat']['turn'] = $newPlayerHealth <= 0 ? 'enemy' : 'player';
        $state['combat']['lastDamageResult'] = $result;
        $state['combat']['battleLog'][] = [
            'message' => $prefix . (string) $combat['currentEnemy']['name'] . ' dealt ' . $result['damage'] . ' damage to you!',
            'type' => 'damage',
        ];
        return $state;
    }

    private function resetCombat(array $state): array
    {
        $state['combat'] = $this->emptyCombat();
        return $state;
    }

    private function playerStats(array $player): array
    {
        $chassis = $this->part('chassis', (int) $player['chassis']);
        $weapon = $this->part('weapons', (int) $player['weapons']);
        $armor = $this->part('armor', (int) $player['armor']);
        $engine = $this->part('engines', (int) $player['engines']);

        return [
            'health' => (int) $chassis['health'],
            'attack' => (int) $weapon['attack'],
            'defense' => (int) $armor['defense'],
            'speed' => (int) $engine['speed'],
        ];
    }

    private function damage(int $baseAttack, int $defense): array
    {
        $variance = 1 + (random_int(-20, 20) / 100);
        $critical = random_int(1, 100) <= 10;
        $damage = (int) floor($baseAttack * $variance * ($critical ? 2 : 1));

        return [
            'damage' => max(1, $damage - $defense),
            'critical' => $critical,
        ];
    }

    private function spendGold(array $state, int $amount): array
    {
        if ($amount < 0) {
            throw new RuntimeException('Gold amount cannot be negative.');
        }
        if ((int) $state['gold'] < $amount) {
            throw new RuntimeException('Not enough gold.');
        }

        $state['gold'] = (int) $state['gold'] - $amount;
        return $state;
    }

    private function partRef(array $payload): array
    {
        $category = $payload['category'] ?? null;
        $index = $payload['index'] ?? null;
        if (!is_string($category) || !in_array($category, ['chassis', 'weapons', 'armor', 'engines'], true)) {
            throw new RuntimeException('Unknown part category.');
        }
        if (!is_int($index) && !is_float($index)) {
            throw new RuntimeException('Part index must be numeric.');
        }

        return [$category, (int) $index];
    }

    private function part(string $category, int $index): array
    {
        $parts = $this->parts();
        if (!isset($parts[$category][$index])) {
            throw new RuntimeException('Part not found.');
        }

        return $parts[$category][$index];
    }

    private function emptyCombat(): array
    {
        return [
            'playerHealth' => 0,
            'playerMaxHealth' => 0,
            'enemyHealth' => 0,
            'enemyMaxHealth' => 0,
            'currentEnemy' => null,
            'turn' => 'player',
            'battleLog' => [],
            'isActive' => false,
            'lastDamageResult' => null,
        ];
    }

    private function withDefaults(array $state): array
    {
        $state = array_replace_recursive($this->initialState(), $state);
        $state['playerStats'] = $this->playerStats($state['player']);
        return $state;
    }

    private function number(mixed $value, string $name): float
    {
        if (!is_int($value) && !is_float($value)) {
            throw new RuntimeException($name . ' must be numeric.');
        }

        return (float) $value;
    }

    private function parts(): array
    {
        return [
            'chassis' => [
                ['name' => 'Basic Frame', 'health' => 50, 'cost' => 0, 'tier' => 'Basic'],
                ['name' => 'Reinforced Frame', 'health' => 80, 'cost' => 100, 'tier' => 'Enhanced'],
                ['name' => 'Combat Frame', 'health' => 120, 'cost' => 300, 'tier' => 'Advanced'],
                ['name' => 'Titan Frame', 'health' => 180, 'cost' => 800, 'tier' => 'Elite'],
            ],
            'weapons' => [
                ['name' => 'Basic Laser', 'attack' => 20, 'cost' => 0, 'tier' => 'Basic'],
                ['name' => 'Plasma Cannon', 'attack' => 35, 'cost' => 150, 'tier' => 'Enhanced'],
                ['name' => 'Ion Blaster', 'attack' => 50, 'cost' => 400, 'tier' => 'Advanced'],
                ['name' => 'Quantum Destroyer', 'attack' => 70, 'cost' => 1000, 'tier' => 'Elite'],
            ],
            'armor' => [
                ['name' => 'Light Plating', 'defense' => 8, 'cost' => 0, 'tier' => 'Basic'],
                ['name' => 'Steel Armor', 'defense' => 15, 'cost' => 120, 'tier' => 'Enhanced'],
                ['name' => 'Composite Armor', 'defense' => 25, 'cost' => 350, 'tier' => 'Advanced'],
                ['name' => 'Nanotech Armor', 'defense' => 40, 'cost' => 900, 'tier' => 'Elite'],
            ],
            'engines' => [
                ['name' => 'Standard Engine', 'speed' => 10, 'cost' => 0, 'tier' => 'Basic'],
                ['name' => 'Turbo Engine', 'speed' => 18, 'cost' => 100, 'tier' => 'Enhanced'],
                ['name' => 'Hyperdrive', 'speed' => 28, 'cost' => 300, 'tier' => 'Advanced'],
                ['name' => 'Warp Core', 'speed' => 40, 'cost' => 700, 'tier' => 'Elite'],
            ],
        ];
    }
}
