import Router from '../src/core/router';
import { NewsDetailView, NewsFeedView } from './page';
import { Store } from './types';
/// mix in

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

const store: Store = {
  currentPage: 1,
  feeds: [],
};

declare global {
  interface Window {
    store: Store;
  }
}

window.store = store;

const router = new Router();
const newsFeedView = new NewsFeedView('root');
const newsDetailView = new NewsDetailView('root');

router.setDefaultPage(newsFeedView);
router.addRoutePath('/page/', newsFeedView);
router.addRoutePath('/show/', newsDetailView);

router.route();
