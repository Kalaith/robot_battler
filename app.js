// Robot Battler Game Logic
class RobotBattler {
    constructor() {
        this.gameData = {
            robot_parts: {
                chassis: [
                    {"name": "Basic Frame", "health": 50, "cost": 0, "tier": "Basic"},
                    {"name": "Reinforced Frame", "health": 80, "cost": 100, "tier": "Enhanced"},
                    {"name": "Combat Frame", "health": 120, "cost": 300, "tier": "Advanced"},
                    {"name": "Titan Frame", "health": 180, "cost": 800, "tier": "Elite"}
                ],
                weapons: [
                    {"name": "Basic Laser", "attack": 20, "cost": 0, "tier": "Basic"},
                    {"name": "Plasma Cannon", "attack": 35, "cost": 150, "tier": "Enhanced"},
                    {"name": "Ion Blaster", "attack": 50, "cost": 400, "tier": "Advanced"},
                    {"name": "Quantum Destroyer", "attack": 70, "cost": 1000, "tier": "Elite"}
                ],
                armor: [
                    {"name": "Light Plating", "defense": 8, "cost": 0, "tier": "Basic"},
                    {"name": "Steel Armor", "defense": 15, "cost": 120, "tier": "Enhanced"},
                    {"name": "Composite Armor", "defense": 25, "cost": 350, "tier": "Advanced"},
                    {"name": "Nanotech Armor", "defense": 40, "cost": 900, "tier": "Elite"}
                ],
                engines: [
                    {"name": "Standard Engine", "speed": 10, "cost": 0, "tier": "Basic"},
                    {"name": "Turbo Engine", "speed": 18, "cost": 100, "tier": "Enhanced"},
                    {"name": "Hyperdrive", "speed": 28, "cost": 300, "tier": "Advanced"},
                    {"name": "Warp Core", "speed": 40, "cost": 700, "tier": "Elite"}
                ]
            },
            enemies: [
                {"name": "Scrap Bot", "health": 50, "attack": 15, "defense": 5, "speed": 10, "gold": 25, "difficulty": "Easy"},
                {"name": "Guard Bot", "health": 80, "attack": 25, "defense": 12, "speed": 15, "gold": 50, "difficulty": "Medium"},
                {"name": "War Bot", "health": 120, "attack": 35, "defense": 20, "speed": 12, "gold": 100, "difficulty": "Hard"},
                {"name": "Titan Bot", "health": 200, "attack": 50, "defense": 30, "speed": 8, "gold": 200, "difficulty": "Elite"}
            ],
            game_balance: {
                starting_gold: 100,
                damage_variance: 0.2,
                critical_hit_chance: 0.1,
                dodge_chance_per_speed: 0.02
            }
        };

        this.gameState = {
            gold: 100,
            wins: 0,
            currentScreen: 'main-menu',
            player: {
                chassis: 0,
                weapons: 0,
                armor: 0,
                engines: 0,
                ownedParts: {
                    chassis: [0],
                    weapons: [0],
                    armor: [0],
                    engines: [0]
                }
            },
            combat: {
                playerHealth: 0,
                playerMaxHealth: 0,
                enemyHealth: 0,
                enemyMaxHealth: 0,
                currentEnemy: null,
                turn: 'player',
                battleLog: []
            }
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.updateDisplay();
        this.updateRobotVisual();
    }

    bindEvents() {
        // Main menu navigation
        document.getElementById('battle-btn').addEventListener('click', () => this.showScreen('enemy-selection'));
        document.getElementById('shop-btn').addEventListener('click', () => this.showScreen('parts-shop'));
        document.getElementById('back-to-menu').addEventListener('click', () => this.showScreen('main-menu'));
        document.getElementById('back-to-menu-shop').addEventListener('click', () => this.showScreen('main-menu'));

        // Enemy selection
        document.querySelectorAll('.fight-btn').forEach((btn, index) => {
            btn.addEventListener('click', () => this.startBattle(index));
        });

        // Combat controls
        document.getElementById('attack-btn').addEventListener('click', () => this.playerAttack());
        document.getElementById('defend-btn').addEventListener('click', () => this.playerDefend());
        document.getElementById('special-btn').addEventListener('click', () => this.playerSpecial());

        // Battle result
        document.getElementById('continue-btn').addEventListener('click', () => this.showScreen('main-menu'));

        // Shop tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.showShopCategory(btn.dataset.category));
        });
    }

    showScreen(screenId) {
        document.querySelectorAll('.game-screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
        this.gameState.currentScreen = screenId;

        if (screenId === 'parts-shop') {
            this.showShopCategory('chassis');
        }
    }

    getPlayerStats() {
        const chassis = this.gameData.robot_parts.chassis[this.gameState.player.chassis];
        const weapon = this.gameData.robot_parts.weapons[this.gameState.player.weapons];
        const armor = this.gameData.robot_parts.armor[this.gameState.player.armor];
        const engine = this.gameData.robot_parts.engines[this.gameState.player.engines];

        return {
            health: chassis.health,
            attack: weapon.attack,
            defense: armor.defense,
            speed: engine.speed
        };
    }

    updateDisplay() {
        document.getElementById('gold-display').textContent = this.gameState.gold;
        document.getElementById('wins-display').textContent = this.gameState.wins;

        const stats = this.getPlayerStats();
        document.getElementById('player-health-stat').textContent = stats.health;
        document.getElementById('player-attack-stat').textContent = stats.attack;
        document.getElementById('player-defense-stat').textContent = stats.defense;
        document.getElementById('player-speed-stat').textContent = stats.speed;
    }

    updateRobotVisual() {
        const chassis = this.gameData.robot_parts.chassis[this.gameState.player.chassis];
        const weapon = this.gameData.robot_parts.weapons[this.gameState.player.weapons];
        const armor = this.gameData.robot_parts.armor[this.gameState.player.armor];
        const engine = this.gameData.robot_parts.engines[this.gameState.player.engines];

        // Update main menu robot
        const robot = document.getElementById('player-robot');
        robot.className = `robot tier-${chassis.tier}`;

        // Update combat robot if in combat
        const combatRobot = document.getElementById('combat-player-robot');
        if (combatRobot) {
            combatRobot.className = `robot combat-robot tier-${chassis.tier}`;
        }
    }

    startBattle(enemyIndex) {
        const enemy = this.gameData.enemies[enemyIndex];
        this.gameState.combat.currentEnemy = enemy;
        
        const playerStats = this.getPlayerStats();
        this.gameState.combat.playerHealth = playerStats.health;
        this.gameState.combat.playerMaxHealth = playerStats.health;
        this.gameState.combat.enemyHealth = enemy.health;
        this.gameState.combat.enemyMaxHealth = enemy.health;
        this.gameState.combat.turn = 'player';
        this.gameState.combat.battleLog = [];

        this.showScreen('combat-screen');
        this.updateCombatDisplay();
        this.addBattleLog(`Battle started against ${enemy.name}!`);
    }

    updateCombatDisplay() {
        const enemy = this.gameState.combat.currentEnemy;
        
        // Update enemy name and visual
        document.getElementById('enemy-name').textContent = enemy.name;
        const enemyRobot = document.getElementById('combat-enemy-robot');
        enemyRobot.className = `robot combat-robot ${enemy.name.toLowerCase().replace(' ', '-')}`;

        // Update health bars
        this.updateHealthBar('player');
        this.updateHealthBar('enemy');

        // Update robot visual
        this.updateRobotVisual();
    }

    updateHealthBar(type) {
        const health = type === 'player' ? this.gameState.combat.playerHealth : this.gameState.combat.enemyHealth;
        const maxHealth = type === 'player' ? this.gameState.combat.playerMaxHealth : this.gameState.combat.enemyMaxHealth;
        const percentage = Math.max(0, (health / maxHealth) * 100);

        document.getElementById(`${type}-health-bar`).style.width = `${percentage}%`;
        document.getElementById(`${type}-health-text`).textContent = `${Math.max(0, health)}/${maxHealth}`;
    }

    addBattleLog(message, type = 'info') {
        this.gameState.combat.battleLog.push({ message, type });
        const logContainer = document.getElementById('log-messages');
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.textContent = message;
        logContainer.appendChild(logEntry);
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    calculateDamage(attacker, defender, baseAttack) {
        const variance = 1 + (Math.random() - 0.5) * 2 * this.gameData.game_balance.damage_variance;
        const criticalHit = Math.random() < this.gameData.game_balance.critical_hit_chance;
        const critMultiplier = criticalHit ? 2 : 1;
        
        let damage = Math.floor(baseAttack * variance * critMultiplier);
        damage = Math.max(1, damage - defender.defense);
        
        return { damage, critical: criticalHit };
    }

    playerAttack() {
        if (this.gameState.combat.turn !== 'player') return;

        const playerStats = this.getPlayerStats();
        const enemy = this.gameState.combat.currentEnemy;
        
        const result = this.calculateDamage(playerStats, enemy, playerStats.attack);
        this.gameState.combat.enemyHealth -= result.damage;

        const message = result.critical ? 
            `Critical hit! You dealt ${result.damage} damage to ${enemy.name}!` :
            `You dealt ${result.damage} damage to ${enemy.name}!`;
        
        this.addBattleLog(message, 'damage');
        this.animateAttack('player');
        this.updateHealthBar('enemy');

        if (this.gameState.combat.enemyHealth <= 0) {
            this.endBattle(true);
        } else {
            this.gameState.combat.turn = 'enemy';
            setTimeout(() => this.enemyTurn(), 1500);
        }
    }

    playerDefend() {
        if (this.gameState.combat.turn !== 'player') return;

        const healAmount = Math.floor(this.gameState.combat.playerMaxHealth * 0.1);
        this.gameState.combat.playerHealth = Math.min(
            this.gameState.combat.playerMaxHealth,
            this.gameState.combat.playerHealth + healAmount
        );

        this.addBattleLog(`You defended and recovered ${healAmount} health!`, 'healing');
        this.updateHealthBar('player');

        this.gameState.combat.turn = 'enemy';
        setTimeout(() => this.enemyTurn(), 1500);
    }

    playerSpecial() {
        if (this.gameState.combat.turn !== 'player') return;

        const playerStats = this.getPlayerStats();
        const enemy = this.gameState.combat.currentEnemy;
        
        // Special attack does 1.5x damage but has a cooldown
        const result = this.calculateDamage(playerStats, enemy, Math.floor(playerStats.attack * 1.5));
        this.gameState.combat.enemyHealth -= result.damage;

        this.addBattleLog(`Special attack! You dealt ${result.damage} damage to ${enemy.name}!`, 'damage');
        this.animateAttack('player');
        this.updateHealthBar('enemy');

        // Disable special button temporarily
        document.getElementById('special-btn').disabled = true;
        setTimeout(() => {
            document.getElementById('special-btn').disabled = false;
        }, 3000);

        if (this.gameState.combat.enemyHealth <= 0) {
            this.endBattle(true);
        } else {
            this.gameState.combat.turn = 'enemy';
            setTimeout(() => this.enemyTurn(), 1500);
        }
    }

    enemyTurn() {
        if (this.gameState.combat.turn !== 'enemy') return;

        const enemy = this.gameState.combat.currentEnemy;
        const playerStats = this.getPlayerStats();
        
        const result = this.calculateDamage(enemy, playerStats, enemy.attack);
        this.gameState.combat.playerHealth -= result.damage;

        const message = result.critical ? 
            `Critical hit! ${enemy.name} dealt ${result.damage} damage to you!` :
            `${enemy.name} dealt ${result.damage} damage to you!`;
        
        this.addBattleLog(message, 'damage');
        this.animateAttack('enemy');
        this.updateHealthBar('player');

        if (this.gameState.combat.playerHealth <= 0) {
            this.endBattle(false);
        } else {
            this.gameState.combat.turn = 'player';
        }
    }

    animateAttack(attacker) {
        const robotElement = document.getElementById(attacker === 'player' ? 'combat-player-robot' : 'combat-enemy-robot');
        const targetElement = document.getElementById(attacker === 'player' ? 'combat-enemy-robot' : 'combat-player-robot');
        
        robotElement.classList.add('attacking');
        targetElement.classList.add('damaged');
        
        setTimeout(() => {
            robotElement.classList.remove('attacking');
            targetElement.classList.remove('damaged');
        }, 500);

        // Add particle effect
        this.createParticleEffect(targetElement);
    }

    createParticleEffect(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            particle.style.setProperty('--particle-x', `${(Math.random() - 0.5) * 100}px`);
            particle.style.setProperty('--particle-y', `${(Math.random() - 0.5) * 100}px`);
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                document.body.removeChild(particle);
            }, 1000);
        }
    }

    endBattle(victory) {
        const enemy = this.gameState.combat.currentEnemy;
        
        if (victory) {
            this.gameState.gold += enemy.gold;
            this.gameState.wins++;
            document.getElementById('result-title').textContent = 'Victory!';
            document.getElementById('result-title').classList.remove('defeat');
            document.getElementById('result-message').textContent = `You defeated the ${enemy.name}!`;
            document.getElementById('gold-earned').textContent = `+${enemy.gold} Gold`;
            this.addBattleLog(`Victory! You earned ${enemy.gold} gold!`, 'healing');
        } else {
            document.getElementById('result-title').textContent = 'Defeat';
            document.getElementById('result-title').classList.add('defeat');
            document.getElementById('result-message').textContent = `You were defeated by the ${enemy.name}...`;
            document.getElementById('gold-earned').textContent = 'No gold earned';
            this.addBattleLog('Defeat! Try upgrading your robot and try again.', 'damage');
        }

        setTimeout(() => {
            this.showScreen('battle-result');
            this.updateDisplay();
        }, 2000);
    }

    showShopCategory(category) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        // Generate parts grid
        const partsGrid = document.getElementById('parts-grid');
        partsGrid.innerHTML = '';

        this.gameData.robot_parts[category].forEach((part, index) => {
            const partCard = document.createElement('div');
            partCard.className = 'part-card';
            
            const isOwned = this.gameState.player.ownedParts[category].includes(index);
            const isEquipped = this.gameState.player[category] === index;
            const canAfford = this.gameState.gold >= part.cost;

            if (isOwned) partCard.classList.add('owned');
            if (isEquipped) partCard.classList.add('equipped');

            const statName = category === 'chassis' ? 'Health' : 
                           category === 'weapons' ? 'Attack' : 
                           category === 'armor' ? 'Defense' : 'Speed';
            const statValue = part[category === 'chassis' ? 'health' : 
                                 category === 'weapons' ? 'attack' : 
                                 category === 'armor' ? 'defense' : 'speed'];

            partCard.innerHTML = `
                <div class="part-tier ${part.tier}">${part.tier}</div>
                <h3>${part.name}</h3>
                <div class="part-stats">
                    <div class="stat-row">
                        <span>${statName}:</span>
                        <span>+${statValue}</span>
                    </div>
                </div>
                <div class="part-cost ${part.cost === 0 ? 'free' : ''}">${part.cost === 0 ? 'Free' : part.cost + ' Gold'}</div>
                <button class="btn ${isEquipped ? 'btn--success' : isOwned ? 'btn--secondary' : canAfford ? 'btn--primary' : 'btn--outline'} btn--full-width" 
                        ${!canAfford && !isOwned ? 'disabled' : ''}>
                    ${isEquipped ? 'Equipped' : isOwned ? 'Equip' : canAfford ? 'Buy' : 'Not Enough Gold'}
                </button>
            `;

            const button = partCard.querySelector('button');
            button.addEventListener('click', () => this.handlePartPurchase(category, index, part));

            partsGrid.appendChild(partCard);
        });
    }

    handlePartPurchase(category, index, part) {
        const isOwned = this.gameState.player.ownedParts[category].includes(index);
        const isEquipped = this.gameState.player[category] === index;

        if (isEquipped) {
            return; // Already equipped
        }

        if (isOwned) {
            // Equip the part
            this.gameState.player[category] = index;
            this.updateDisplay();
            this.updateRobotVisual();
            this.showShopCategory(category);
        } else if (this.gameState.gold >= part.cost) {
            // Buy and equip the part
            this.gameState.gold -= part.cost;
            this.gameState.player.ownedParts[category].push(index);
            this.gameState.player[category] = index;
            this.updateDisplay();
            this.updateRobotVisual();
            this.showShopCategory(category);
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new RobotBattler();
});