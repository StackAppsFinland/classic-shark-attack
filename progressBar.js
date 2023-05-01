class ProgressBar {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.outerWidth = 104;
        this.outerHeight = 18;
        this.innerHeight = 16;
        this.innerXOffset = 2;
        this.container = new PIXI.Container();

        this.createOuterRectangle();
        this.createInnerRectangle();
    }

    createOuterRectangle() {
        const outerRectangle = new PIXI.Graphics();
        outerRectangle.lineStyle(1, 0xc0c0c0, 1);
        outerRectangle.drawRect(0, 0, this.outerWidth, this.outerHeight);
        outerRectangle.x = this.x;
        outerRectangle.y = this.y;
        this.container.addChild(outerRectangle);
    }

    createInnerRectangle() {
        const innerRectangle = new PIXI.Graphics();
        innerRectangle.beginFill('darkred');
        innerRectangle.drawRect(0, 0, 0, this.innerHeight -1);
        innerRectangle.endFill();
        innerRectangle.x = this.x + this.innerXOffset;
        innerRectangle.y = this.y + this.innerXOffset;
        this.innerRectangle = innerRectangle;
        this.container.addChild(innerRectangle);
    }

    setPercentage(percentage) {
        const innerWidth = (this.outerWidth - this.innerXOffset * 2) * (percentage / 100);
        this.innerRectangle.clear();
        this.innerRectangle.beginFill('darkred');
        this.innerRectangle.drawRect(0, 0, innerWidth, this.innerHeight -1);
        this.innerRectangle.endFill();
    }
}

export default ProgressBar;
