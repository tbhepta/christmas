import Phaser from 'phaser';

interface Card {
  text: string;
  isGood: boolean;
}

export default class MainScene extends Phaser.Scene {
  private cards: Card[] = [];
  private currentCardIndex: number = 0;
  private score: number = 0;
  private cardText!: Phaser.GameObjects.Text;
  private cardBackground!: Phaser.GameObjects.Rectangle;
  private leftButton!: Phaser.GameObjects.Text;
  private rightButton!: Phaser.GameObjects.Text;
  private snowflakes: Phaser.Physics.Arcade.Sprite[] = [];
  private counterText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MainScene' });
  }

  create() {
    // Initialize cards with developer statements
    this.cards = [
      { text: 'git push --force', isGood: false },
      { text: 'Writing unit tests', isGood: true },
      { text: 'Code without comments', isGood: false },
      { text: 'Using meaningful\nvariable names', isGood: true },
      { text: 'Committing node_modules', isGood: false },
      { text: 'Code reviews before merge', isGood: true },
      { text: 'TODO: fix this later', isGood: false },
      { text: 'Proper error handling', isGood: true },
      { text: 'Copy-paste from\nStack Overflow', isGood: false },
      { text: 'Reading documentation', isGood: true }
    ];

    // Shuffle cards for variety
    this.cards = Phaser.Utils.Array.Shuffle(this.cards);

    // Create snowflake texture once
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 0.8);
    graphics.fillCircle(4, 4, 3);
    graphics.generateTexture('snowflake', 8, 8);
    graphics.destroy();

    // Create snowy background
    this.createSnowyBackground();

    // Create title
    this.add.text(400, 50, '🎄 Developer Judge 🎅', {
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#ff0000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Create counter
    this.counterText = this.add.text(400, 100, `Card ${this.currentCardIndex + 1} of ${this.cards.length}`, {
      fontSize: '20px',
      color: '#ffff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Create card
    this.createCard();

    // Create buttons
    this.createButtons();

    // Create continuous snowfall
    this.time.addEvent({
      delay: 200,
      callback: this.createSnowflake,
      callbackScope: this,
      loop: true
    });
  }

  private createSnowyBackground() {
    // Create gradient background effect with rectangles
    const colors = [0x1a1a2e, 0x16213e, 0x0f3460];
    for (let i = 0; i < 3; i++) {
      this.add.rectangle(400, 200 * i, 800, 200, colors[i]).setOrigin(0.5, 0);
    }

    // Add some initial snowflakes
    for (let i = 0; i < 30; i++) {
      this.createSnowflake();
    }
  }

  private createSnowflake() {
    const x = Phaser.Math.Between(0, 800);
    const snowflake = this.physics.add.sprite(x, -10, 'snowflake');
    
    snowflake.setVelocityY(Phaser.Math.Between(50, 150));
    snowflake.setVelocityX(Phaser.Math.Between(-20, 20));
    
    this.snowflakes.push(snowflake);

    // Remove snowflakes that go off screen
    if (this.snowflakes.length > 50) {
      const old = this.snowflakes.shift();
      old?.destroy();
    }
  }

  private createCard() {
    // Card background with Christmas colors
    this.cardBackground = this.add.rectangle(400, 300, 500, 250, 0xffffff);
    this.cardBackground.setStrokeStyle(4, 0xc41e3a);

    // Card text
    const card = this.cards[this.currentCardIndex];
    this.cardText = this.add.text(400, 300, card.text, {
      fontSize: '28px',
      color: '#2d3561',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: 450 }
    }).setOrigin(0.5);

    // Add decorative elements
    this.add.text(150, 300, '🎁', { fontSize: '40px' });
    this.add.text(620, 300, '⭐', { fontSize: '40px' });
  }

  private createButtons() {
    // Left button (Dislike - Naughty)
    const leftBg = this.add.rectangle(250, 500, 150, 60, 0xc41e3a);
    leftBg.setInteractive({ useHandCursor: true });
    leftBg.on('pointerdown', () => this.swipeLeft());
    leftBg.on('pointerover', () => leftBg.setFillStyle(0xff0000));
    leftBg.on('pointerout', () => leftBg.setFillStyle(0xc41e3a));

    this.leftButton = this.add.text(250, 500, '← NOPE', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.leftButton.setInteractive({ useHandCursor: true });
    this.leftButton.on('pointerdown', () => this.swipeLeft());

    // Right button (Like - Nice)
    const rightBg = this.add.rectangle(550, 500, 150, 60, 0x0f7f12);
    rightBg.setInteractive({ useHandCursor: true });
    rightBg.on('pointerdown', () => this.swipeRight());
    rightBg.on('pointerover', () => rightBg.setFillStyle(0x00ff00));
    rightBg.on('pointerout', () => rightBg.setFillStyle(0x0f7f12));

    this.rightButton = this.add.text(550, 500, 'NICE →', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.rightButton.setInteractive({ useHandCursor: true });
    this.rightButton.on('pointerdown', () => this.swipeRight());

    // Keyboard controls
    this.input.keyboard?.on('keydown-LEFT', () => this.swipeLeft());
    this.input.keyboard?.on('keydown-RIGHT', () => this.swipeRight());
  }

  private swipeLeft() {
    const card = this.cards[this.currentCardIndex];
    // Nope means we reject it - good if the statement is bad
    if (!card.isGood) {
      this.score++;
    }
    this.nextCard();
  }

  private swipeRight() {
    const card = this.cards[this.currentCardIndex];
    // Nice means we approve - good if the statement is good
    if (card.isGood) {
      this.score++;
    }
    this.nextCard();
  }

  private nextCard() {
    this.currentCardIndex++;

    if (this.currentCardIndex >= this.cards.length) {
      this.showResult();
    } else {
      // Animate card transition
      this.tweens.add({
        targets: [this.cardBackground, this.cardText],
        alpha: 0,
        duration: 200,
        onComplete: () => {
          const card = this.cards[this.currentCardIndex];
          this.cardText.setText(card.text);
          this.counterText.setText(`Card ${this.currentCardIndex + 1} of ${this.cards.length}`);
          
          this.tweens.add({
            targets: [this.cardBackground, this.cardText],
            alpha: 1,
            duration: 200
          });
        }
      });
    }
  }

  private showResult() {
    // Clear the scene
    this.children.removeAll();
    this.snowflakes = [];

    // Create snowy background again
    this.createSnowyBackground();

    const percentage = (this.score / this.cards.length) * 100;
    let verdict: string;
    let message: string;
    let color: string;

    if (percentage >= 70) {
      verdict = '🎅 NICE DEVELOPER! 🎄';
      message = `You scored ${this.score}/${this.cards.length}!\n\nYou're on Santa's nice list!\nYou deserve a Christmas bonus! 🎁`;
      color = '#00ff00';
    } else if (percentage >= 50) {
      verdict = '🤔 SOMEWHAT NAUGHTY 🎅';
      message = `You scored ${this.score}/${this.cards.length}!\n\nYou're in the gray area...\nTry to improve your practices! ⚠️`;
      color = '#ffff00';
    } else {
      verdict = '😈 NAUGHTY DEVELOPER! 🔥';
      message = `You scored ${this.score}/${this.cards.length}!\n\nYou're on the naughty list!\nNo cookies for you! 🚫`;
      color = '#ff0000';
    }

    // Verdict title
    this.add.text(400, 150, verdict, {
      fontSize: '42px',
      color: color,
      fontStyle: 'bold',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Result message
    this.add.text(400, 300, message, {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
      lineSpacing: 10
    }).setOrigin(0.5);

    // Play again button
    const playAgainBg = this.add.rectangle(400, 480, 200, 60, 0x0f7f12);
    playAgainBg.setInteractive({ useHandCursor: true });
    playAgainBg.on('pointerdown', () => this.scene.restart());
    playAgainBg.on('pointerover', () => playAgainBg.setFillStyle(0x00ff00));
    playAgainBg.on('pointerout', () => playAgainBg.setFillStyle(0x0f7f12));

    const playAgainText = this.add.text(400, 480, 'PLAY AGAIN', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    playAgainText.setInteractive({ useHandCursor: true });
    playAgainText.on('pointerdown', () => this.scene.restart());

    // Continue snowfall
    this.time.addEvent({
      delay: 200,
      callback: this.createSnowflake,
      callbackScope: this,
      loop: true
    });
  }

  update() {
    // Clean up snowflakes that fall off screen
    this.snowflakes = this.snowflakes.filter(snowflake => {
      if (snowflake.y > 650) {
        snowflake.destroy();
        return false;
      }
      return true;
    });
  }
}
