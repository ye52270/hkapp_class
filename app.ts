/// mix in
interface Store {
  currentPage: number;
  feeds: NewsFeed[];
}
interface News {
  readonly id: number;
  readonly time_ago: string;
  readonly title: string;
  readonly url: string;
  readonly user: string;
  readonly content: string;
}
interface NewsFeed extends News {
  readonly comments_count: number;
  readonly points: number;
  read?: boolean;
}

interface NewsDetail extends News {
  readonly comments: NewsComment[];
}

interface NewsComment extends News {
  readonly comments: NewsComment[];
  readonly level: number;
}

interface RouteInfo {
  path: string;
  page: View;
}

const container: HTMLElement | null = document.getElementById('root');
const ajax: XMLHttpRequest = new XMLHttpRequest();
const content = document.createElement('div');
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/:id.json';
const store: Store = {
  currentPage: 1,
  feeds: [],
};

// function applyMixins(derivedCtor: any, baseCtors: any[]) {
//   baseCtors.forEach((baseCtor) => {
//     Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
//       const descriptor = Object.getOwnPropertyDescriptor(baseCtor.prototype, name);

//       if (descriptor) {
//         Object.defineProperty(derivedCtor.prototype, name, descriptor);
//       }
//     });
//   });
// }

class Api {
  url: string;
  ajax: XMLHttpRequest;
  constructor(url: string) {
    this.url = url;
    this.ajax = new XMLHttpRequest();
  }
  protected getRequest<AjaxResponse>(): AjaxResponse {
    this.ajax.open('GET', this.url, false);
    this.ajax.send();
    return JSON.parse(this.ajax.response);
  }
}

class NewsFeedApi extends Api {
  getData(): NewsFeed[] {
    return this.getRequest<NewsFeed[]>();
  }
}
class NewsDetailApi extends Api {
  getData(): NewsDetail {
    return this.getRequest<NewsDetail>();
  }
}

abstract class View {
  template: string;
  renderTemplate: string;
  container: HTMLElement;
  htmlList: string[];

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

  addHtml(htmlString: string): void {
    this.htmlList.push(htmlString);
  }

  getHtml(): string {
    //htmlList를 join한 다음, 배열을 초기화 한다
    const snapShot = this.htmlList.join('');
    this.clearHtmlList();
    return snapShot;
  }

  setTemplateData(key: string, value: string): void {
    this.renderTemplate = this.renderTemplate.replace(`{{__${key}__}}`, value);
  }

  updateView(): void {
    this.container.innerHTML = this.renderTemplate;
    this.renderTemplate = this.template; // renderTemplate 이 다음에 다시 호출될 수 있으니 원본 template으로 초기화를 한다
  }

  clearHtmlList(): void {
    this.htmlList = [];
  }

  abstract render(): void;
}

class Router {
  routeTable: RouteInfo[];
  defaultRoute: RouteInfo | null;
  constructor() {
    this.routeTable = [];
    this.defaultRoute = null;
    window.addEventListener('hashchange', () => {
      this.route();
    });
  }

  setDefaultPage(page: View): void {
    this.defaultRoute = { path: '', page };
  }

  addRoutePath(path: string, page: View): void {
    this.routeTable.push({ path, page });
  }

  route(): void {
    const routePath = location.hash;

    if (routePath === '' && this.defaultRoute) {
      this.defaultRoute.page.render();
    }

    for (const routeInfo of this.routeTable) {
      if (routePath.indexOf(routeInfo.path) >= 0) {
        routeInfo.page.render();

        break;
      }
    }
  }
}
class NewsFeedView extends View {
  api: NewsFeedApi;
  feeds: NewsFeed[];
  constructor(contaierId: string) {
    let template = `
    <div class="bg-gray-600 min-h-screen">
      <div class="bg-white text-xl">
        <div class="mx-auto px-4">
          <div class="flex justify-between items-center py-6">
            <div class="flex justify-start">
              <h1 class="font-extrabold">Hacker News</h1>
            </div>
            <div class="items-center justify-end">
              <a href="#/page/{{__prev__page__}}" class="text-gray-500">
                Previous
              </a>
              <a href="#/page/{{__next__page__}}" class="text-gray-500 ml-4">
                Next
              </a>
            </div>
          </div> 
        </div>
      </div>
      <div class="p-4 text-2xl text-gray-700">
        {{__news__feed__}}        
      </div>
  </div>
  `;
    super(contaierId, template);
    this.api = new NewsFeedApi(NEWS_URL);
    this.feeds = store.feeds;

    if (this.feeds.length === 0) {
      this.feeds = store.feeds = this.api.getData();
      this.makeFeeds();
    }
  }

  render(): void {
    const paging: number = 9;
    const pageCount: number =
      this.feeds.length % paging === 0
        ? Math.floor(this.feeds.length / paging)
        : Math.floor(this.feeds.length / paging) + 1;
    store.currentPage = Number(location.hash.substring(7)) || 1;
    for (let i = (store.currentPage - 1) * paging; i < store.currentPage * paging; i++) {
      if (i === this.feeds.length) break;
      const { read, id, title, comments_count, user, points, time_ago } = this.feeds[i];
      this.addHtml(`
          <div class="p-6 bg-white mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
            <div class="flex">
              <div class="flex-auto">             
              <i class="fas fa-circle mr-1" style="
              ${read ? 'color:red' : 'color:gray'}
              "></i>
                <a href="#/show/${id}">
                  ${title}
                </a>  
              </div>
              <div class="text-center text-sm">
                <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${comments_count}</div>
              </div>
            </div>
            <div class="flex mt-3">
              <div class="grid grid-cols-3 text-sm text-gray-500">
                <div><i class="fas fa-user mr-1"></i>${user}</div>
                <div><i class="fas fa-heart mr-1"></i>${points}</div>
                <div><i class="far fa-clock mr-1"></i>${time_ago}</div>
              </div>  
            </div>
          </div>    
        `);
    }
    this.setTemplateData('news__feed', this.getHtml());
    this.setTemplateData(
      'prev__page',
      String(store.currentPage > 1 ? store.currentPage - 1 : store.currentPage)
    );

    this.setTemplateData(
      'next__page',
      String(store.currentPage < pageCount ? store.currentPage + 1 : pageCount)
    );

    this.updateView();
  }

  makeFeeds(): void {
    for (let i = 0; i < this.feeds.length; i++) {
      this.feeds[i].read = false;
    }
  }
}

class NewsDetailView extends View {
  constructor(containerId: string) {
    let template = `
    <div class="bg-gray-600 min-h-screen pb-8">
    <div class="bg-white text-xl">
      <div class="mx-auto px-4">
        <div class="flex justify-between items-center py-6">
          <div class="flex justify-start">
            <h1 class="font-extrabold">Hacker News</h1>
          </div>
          <div class="items-center justify-end">
            <a href="#/page/{{__currentPage__}}" class="text-gray-500">
              <i class="fa fa-times"></i>
            </a>
          </div>
        </div>
      </div>
    </div>

    <div class="h-full border rounded-xl bg-white m-6 p-4 ">
      <h2>{{__title__}}</h2>
      <div class="text-gray-400 h-200">
        {{__content__}}
      </div>

      {{__comments__}}

    </div>
  </div>
  `;
    super(containerId, template);
  }

  render() {
    const id: string = location.hash.substring(7);
    const api: NewsDetailApi = new NewsDetailApi(CONTENT_URL.replace(':id', id));
    const newsContent: NewsDetail = api.getData();

    store.feeds.filter((value) => {
      Number(value.id) === Number(id) && (value.read = true);
    });

    this.setTemplateData('currentPage', String(store.currentPage));
    this.setTemplateData('title', newsContent.title);
    this.setTemplateData('content', newsContent.content);
    this.setTemplateData('comments', this.makeComment(newsContent.comments));
    this.updateView();
  }

  makeComment(comments: NewsComment[]): string {
    for (let i = 0; i < comments.length; i++) {
      const {
        level,
        time_ago,
        user,
        content,
        comments: [],
      } = comments[i];

      this.addHtml(`
        <div style="padding-left: ${level * 40}px;" class="mt-4">
          <div class="text-gray-400">
            <i class="fa fa-sort-up mr-2"></i>
            <strong>${user}</strong> ${time_ago}
          </div>
           <p class="text-gray-700">${content}</p>
        </div>    
       `);
      if (comments[i].comments.length > 0) {
        this.addHtml(this.makeComment(comments[i].comments));
      }
    }
    return this.getHtml();
  }
}
// class Api {
//   getRequest<AjaxResponse>(url: string): AjaxResponse {
//     const ajax = new XMLHttpRequest();
//     ajax.open('GET', url, false);
//     ajax.send();

//     return JSON.parse(ajax.response);
//   }
// }

// class NewsFeedApi {
//   getData(): NewsFeed[] {
//     return this.getRequest<NewsFeed[]>(NEWS_URL);
//   }
// }
// class NewsDetailApi {
//   getData(id: string): NewsDetail {
//     return this.getRequest<NewsDetail>(CONTENT_URL.replace(':id', id));
//   }
// }

// interface NewsFeedApi extends Api {}
// interface NewsDetailApi extends Api {}

// applyMixins(NewsFeedApi, [Api]);
// applyMixins(NewsDetailApi, [Api]);

const router = new Router();
const newsFeedView = new NewsFeedView('root');
const newsDetailView = new NewsDetailView('root');

router.setDefaultPage(newsFeedView);
router.addRoutePath('/page/', newsFeedView);
router.addRoutePath('/show/', newsDetailView);

router.route();
