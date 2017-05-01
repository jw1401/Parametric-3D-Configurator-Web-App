import { DingiversumAppPage } from './app.po';

describe('cli-app App', () => {
  let page: DingiversumAppPage;

  beforeEach(() => {
    page = new DingiversumAppPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
