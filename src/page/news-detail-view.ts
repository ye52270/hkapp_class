import { CONTENT_URL, template } from '../config';
import { NewsDetail, NewsComment, store } from '../types';
import { View } from '../core/view';
import { NewsDetailApi } from '../core/api';

export default class NewsDetailView extends View {
  constructor(containerId: string) {
    super(containerId, template);
  }

  render() {
    const id: string = location.hash.substring(7);
    const api: NewsDetailApi = new NewsDetailApi(CONTENT_URL.replace(':id', id));
    const newsContent: NewsDetail = api.getData();

    store.feeds.filter((value: store.feeds) => {
      Number(value.id) === Number(id) && (value.read = true);
    });

    this.setTemplateData('currentPage', String(store.currentPage));
    this.setTemplateData('title', newsContent.title);
    this.setTemplateData('content', newsContent.content);
    this.setTemplateData('comments', this.makeComment(newsContent.comments));
    this.updateView();
  }

  private makeComment(comments: NewsComment[]): string {
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
