import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Home } from '../index';
import userEvent from '@testing-library/user-event';

const handlers = [
  rest.get('*jsonplaceholder.typicode.com*', async (req, res, ctx) => {
    return res(
      ctx.json([
        {
          userId: 1,
          id: 1,
          title: 'title1',
          body: 'body1',
          url: 'img1.jpg',
        },
        {
          userId: 2,
          id: 2,
          title: 'title2',
          body: 'body2',
          url: 'img1.jpg',
        },
        {
          userId: 3,
          id: 3,
          title: 'title3',
          body: 'body3',
          url: 'img3.jpg',
        },
      ]),
    );
  }),
];

const server = setupServer(...handlers);

describe('<Home />', () => {
  beforeAll(() => {
    server.listen();
  });

  afterEach(() => server.resetHandlers());

  afterAll(() => {
    server.close();
  });

  it('should render search, posts and load more', async () => {
    render(<Home />);
    const noMorePosts = screen.getByText('Não existem posts =(');

    //quantas assertions vc quer
    expect.assertions(3);

    await waitForElementToBeRemoved(noMorePosts);

    //get placeholder
    const search = screen.getByPlaceholderText(/type your search/i);
    //espero que esteja no documento
    expect(search).toBeInTheDocument();

    //get image todas
    const images = screen.getAllByRole('img', { name: /title/i });
    //espero que tenha quantidade de image
    expect(images).toHaveLength(2);

    //get btn
    const button = screen.getByRole('button', { name: /load more posts/i });
    //espero que tenha um btn
    expect(button).toBeInTheDocument();
  });

  it('should search for posts', async () => {
    render(<Home />);
    const noMorePosts = screen.getByText('Não existem posts =(');

    expect.assertions(10);

    await waitForElementToBeRemoved(noMorePosts);

    const search = screen.getByPlaceholderText(/type your search/i);

    // espero que tenha title1
    expect(screen.getByRole('heading', { name: 'title1 1' })).toBeInTheDocument();
    // espero que tenha title2
    expect(screen.getByRole('heading', { name: 'title2 2' })).toBeInTheDocument();
    // espero que tenha title3
    expect(screen.queryByRole('heading', { name: 'title3 3' })).not.toBeInTheDocument();

    //quero digitar na tela no tittle1
    userEvent.type(search, 'title1');
    expect(screen.getByRole('heading', { name: 'title1 1' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'title2 2' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'title3 3' })).not.toBeInTheDocument();
    //espero que esteja na tela
    expect(screen.getByRole('heading', { name: 'Search value: title1' })).toBeInTheDocument();

    //quero limpar o search
    userEvent.clear(search);
    expect(screen.getByRole('heading', { name: 'title1 1' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'title2 2' })).toBeInTheDocument();

    //quando  ele digitar mais nao existe nada na tela
    userEvent.type(search, 'post does not exist');
    expect(screen.getByText('Não existem posts =(')).toBeInTheDocument();
  });

  //testing do button
  it('should load more posts', async () => {
    render(<Home />);
    const noMorePosts = screen.getByText('Não existem posts =(');

    expect.assertions(2);

    await waitForElementToBeRemoved(noMorePosts);

    // espero que title3 esteja na pagina
    const button = screen.getByRole('button', { name: /load more posts/i });

    userEvent.click(button);
    //espero title 3 esteja na pagina
    expect(screen.getByRole('heading', { name: 'title3 3' })).toBeInTheDocument();
    //btn ta desable
    expect(button).toBeDisabled();
  });
});
