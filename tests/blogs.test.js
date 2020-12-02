Number.prototype._called = {};

const Page = require('./helpers/page');
let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000');
});

afterEach(async () => {
  await page.close();
});

describe('When logged in', async () => {
  beforeEach(async () => {
    await page.login();
    await page.click('a.btn-floating');
  });

  test('When logged in, can se blog create form', async () => {
    const label = await page.getContentsOf('.title label');
    expect(label).toEqual('Blog Title');
  });

  describe('And using valid inputs', async () => {
    beforeEach(async () => {
      await page.type('.title input', 'My title');
      await page.type('.content input', 'My content');
      await page.click('form button');
    });

    test('Submitting takes user to review screen', async () => {
      //Mohl bych ještě testovat obsah TITLE a CONTENT :) 
      const submitBtnLabel = await page.getContentsOf('button.green');
      expect(submitBtnLabel).toMatch('Save Blog');
    });

    test('Submitting than saving adds blog to index page', async () => {
      await page.click('button.green');
      const url = await page.url();

      expect(url).toMatch('http://localhost:3000/blogs');
    });
  });

  describe('And using invalid inputs', async () => {
    beforeEach(async () => {
      await page.click('form button');
    });

    test('the form shows an error message', async () =>{
      const titleErr = await page.getContentsOf('.title .red-text');
      const contentErr = await page.getContentsOf('.content .red-text');

      expect(titleErr).toEqual('You must provide a value');
      expect(contentErr).toEqual('You must provide a value');
    });
  });
});

describe('User is not logged in', async () => {
  const actions = [
    {
    method: 'get',
    path: '/api/blogs/'
  },
  {
    method: 'post',
    path: '/api/blogs/',
    data: { 
      title: 'T',
      content: 'C'
    }
  }
];

  test('Blog related actions are prohibited', async () => {
    const results = await page.execRequests(actions);

    for (let result of results) {
      expect(result).toEqual({ error: 'You must log in!'});
    }
  });
});