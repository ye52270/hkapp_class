import { RouteInfo } from '../types';
import { View } from './view';

export default class Router {
  private routeTable: RouteInfo[];
  private defaultRoute: RouteInfo | null;
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
    console.log(this.routeTable);
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
