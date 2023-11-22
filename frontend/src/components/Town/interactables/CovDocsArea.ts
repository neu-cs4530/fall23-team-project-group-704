import Interactable, { KnownInteractableTypes } from '../Interactable';

export default class CovDocsArea extends Interactable {
  private _isInteracting = false;

  private _infoTextBox: Phaser.GameObjects.Text | undefined;

  addedToScene() {
    super.addedToScene();
    this.setTintFill();
    this.setAlpha(0.3);
    this.setDepth(-1);
    this.scene.add.text(
      this.x - this.displayWidth / 2,
      this.y + this.displayHeight / 2,
      this.name,
      { color: '#FFFFFF', backgroundColor: '#000000' },
    );
  }

  overlapExit(): void {
    if (this._isInteracting) {
      this.townController.interactableEmitter.emit('endInteraction', this);
      this._isInteracting = false;
      this._infoTextBox?.setVisible(false);
    }
  }

  private async _doACrudeTest() {
    const cDocController = this.townController.getCovDocsAreaController(this);
    await cDocController.createNewUser('Joseph', 'password');
    const id = await cDocController.addNewDocument('Joseph');
    await cDocController.openDocument('Joseph', id);
    return cDocController.getDocByID(id);
  }

  private async _showInfoBox() {
    if (!this._infoTextBox) {
      const msg = await this._doACrudeTest();
      this._infoTextBox = this.scene.add
        .text(this.scene.scale.width / 2, this.scene.scale.height / 2, msg, {
          color: '#000000',
          backgroundColor: '#FFFFFF',
        })
        .setScrollFactor(0)
        .setDepth(30);
    }
    this._infoTextBox.setVisible(true);
    this._infoTextBox.x = this.scene.scale.width / 2 - this._infoTextBox.width / 2;
  }

  overlap(): void {
    this._showInfoBox();
  }

  interact(): void {
    this._isInteracting = true;
  }

  getType(): KnownInteractableTypes {
    return 'cdocsArea';
  }
}
