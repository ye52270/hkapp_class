import { View } from '../core/view';
import { NewsFeedApi } from '../core/api';
import { NewsFeed } from '../types';
import { NEWS_URL } from '../config';

export default class NewsFeedView extends View {
  private api: NewsFeedApi;
  private feeds: NewsFeed[];
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
    this.feeds = window.store.feeds;
  }

  async render(): Promise<void> {
    if (!this.feeds.length) {
      this.feeds = window.store.feeds = await this.api.getData();

      this.makeFeeds();
    }
    const paging: number = 9;
    const pageCount: number =
      this.feeds.length % paging === 0
        ? Math.floor(this.feeds.length / paging)
        : Math.floor(this.feeds.length / paging) + 1;
    window.store.currentPage = Number(location.hash.substring(7)) || 1;

    for (
      let i = (window.store.currentPage - 1) * paging;
      i < window.store.currentPage * paging;
      i++
    ) {
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
      String(window.store.currentPage > 1 ? window.store.currentPage - 1 : window.store.currentPage)
    );
    this.setTemplateData(
      'next__page',
      String(window.store.currentPage < pageCount ? window.store.currentPage + 1 : pageCount)
    );
    this.updateView();
  }

  private makeFeeds(): void {
    for (let i = 0; i < this.feeds.length; i++) {
      this.feeds[i].read = false;
    }
  }
}
