import { AdaptableAppPage } from './app.po';

describe('cli-app App', () => {
  let page: AdaptableAppPage;

  beforeEach(() => {
    page = new AdaptableAppPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
