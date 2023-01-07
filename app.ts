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

const container: HTMLElement | null = document.getElementById('root');
const ajax: XMLHttpRequest = new XMLHttpRequest();
const content = document.createElement('div');
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/:id.json';
const store: Store = {
  currentPage: 1,
  feeds: [],
};

function getData<AjaxResponse>(url: string): AjaxResponse {
  ajax.open('GET', url, false);
  ajax.send();

  return JSON.parse(ajax.response);
}

function makeFeeds(feeds: NewsFeed[]): NewsFeed[] {
  for (let i = 0; i < feeds.length; i++) {
    feeds[i].read = false;
  }

  return feeds;
}

function updateView(html: string): void {
  container != null ? (container.innerHTML = html) : console.error('최상위 컨테이너가 없습니다.');
}

function newsFeed(): void {
  let newsFeed: NewsFeed[] = store.feeds;
  const newsList = [];
  const paging = 9;
  const pageCount =
    newsFeed.length % paging === 0
      ? Math.floor(newsFeed.length / paging)
      : Math.floor(newsFeed.length / paging) + 1;
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

  if (newsFeed.length === 0) {
    newsFeed = store.feeds = makeFeeds(getData<NewsFeed[]>(NEWS_URL));
  }
  for (let i = (store.currentPage - 1) * paging; i < store.currentPage * paging; i++) {
    if (i < newsFeed.length) {
      newsList.push(`
        <div class="p-6 bg-white mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
          <div class="flex">
            <div class="flex-auto">             
            <i class="fas fa-circle mr-1" style="
            ${newsFeed[i].read ? 'color:red' : 'color:gray'}
            "></i>
              <a href="#/show/${newsFeed[i].id}">
                ${newsFeed[i].title}
              </a>  
            </div>
            <div class="text-center text-sm">
              <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${
                newsFeed[i].comments_count
              }</div>
            </div>
          </div>
          <div class="flex mt-3">
            <div class="grid grid-cols-3 text-sm text-gray-500">
              <div><i class="fas fa-user mr-1"></i>${newsFeed[i].user}</div>
              <div><i class="fas fa-heart mr-1"></i>${newsFeed[i].points}</div>
              <div><i class="far fa-clock mr-1"></i>${newsFeed[i].time_ago}</div>
            </div>  
          </div>
        </div>    
      `);
    }
  }
  template = template.replace('{{__news__feed__}}', newsList.join(''));
  template = template.replace(
    '{{__prev__page__}}',
    String(store.currentPage > 1 ? store.currentPage - 1 : store.currentPage)
  );
  template = template.replace(
    '{{__next__page__}}',
    String(store.currentPage < pageCount ? store.currentPage + 1 : pageCount)
  );

  updateView(template);

  container != null ? container.innerHTML : console.error('최상위 컨테이너가 없습니다.');
}

function newsDetail() {
  const id: string = location.hash.substring(7);
  const newsContent: NewsDetail = getData<NewsDetail>(CONTENT_URL.replace(':id', id));
  let template = `
    <div class="bg-gray-600 min-h-screen pb-8">
    <div class="bg-white text-xl">
      <div class="mx-auto px-4">
        <div class="flex justify-between items-center py-6">
          <div class="flex justify-start">
            <h1 class="font-extrabold">Hacker News</h1>
          </div>
          <div class="items-center justify-end">
            <a href="#/page/${store.currentPage}" class="text-gray-500">
              <i class="fa fa-times"></i>
            </a>
          </div>
        </div>
      </div>
    </div>

    <div class="h-full border rounded-xl bg-white m-6 p-4 ">
      <h2>${newsContent.title}</h2>
      <div class="text-gray-400 h-200">
        ${newsContent.content}
      </div>

      {{__comments__}}

    </div>
  </div>
  `;

  store.feeds.filter((value) => {
    Number(value.id) === Number(id) && (value.read = true);
  });

  updateView(template.replace('{{__comments__}}', makeComment(newsContent.comments)));
}

window.addEventListener('hashchange', router);

function makeComment(comments: NewsComment[]): string {
  const commentString = [];
  for (let i = 0; i < comments.length; i++) {
    const {
      level,
      time_ago,
      user,
      content,
      comments: [],
    } = comments[i];
    commentString.push(`
      <div style="padding-left: ${level * 40}px;" class="mt-4">
        <div class="text-gray-400">
          <i class="fa fa-sort-up mr-2"></i>
          <strong>${user}</strong> ${time_ago}
        </div>
         <p class="text-gray-700">${content}</p>
      </div>    
     `);
    if (comments[i].comments.length > 0) {
      commentString.push(makeComment(comments[i].comments));
    }
  }
  return commentString.join('');
}

function router(): void {
  const routePath = location.hash;
  const status = routePath.substring(2, 6);
  switch (status) {
    case 'page':
      store.currentPage = Number(routePath.substring(7));
      newsFeed();
      break;
    case 'show':
      newsDetail();
      break;
    case '':
      newsFeed();
      break;
  }
}

router();
