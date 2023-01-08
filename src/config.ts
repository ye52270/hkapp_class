export const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
export const CONTENT_URL = 'https://api.hnpwa.com/v0/item/:id.json';

export let template = `
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
