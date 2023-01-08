export abstract class View {
  private template: string;
  private renderTemplate: string;
  private container: HTMLElement;
  private htmlList: string[];

  constructor(containerID: string, template: string) {
    const isThereRootContainer = document.getElementById(containerID);
    if (!isThereRootContainer) {
      throw new Error('최상의 컨테이너가 없어서 앱 실행을 하지못합니다');
    }

    this.container = isThereRootContainer;
    this.template = template;
    this.renderTemplate = template;
    this.htmlList = [];
  }

  protected addHtml(htmlString: string): void {
    this.htmlList.push(htmlString);
  }

  protected getHtml(): string {
    //htmlList를 join한 다음, 배열을 초기화 한다
    const snapShot = this.htmlList.join('');
    this.clearHtmlList();
    return snapShot;
  }

  protected setTemplateData(key: string, value: string): void {
    this.renderTemplate = this.renderTemplate.replace(`{{__${key}__}}`, value);
  }

  protected updateView(): void {
    this.container.innerHTML = this.renderTemplate;
    this.renderTemplate = this.template; // renderTemplate 이 다음에 다시 호출될 수 있으니 원본 template으로 초기화를 한다
  }

  protected clearHtmlList(): void {
    this.htmlList = [];
  }

  abstract render(): void;
}
