const Hapi = require('@hapi/hapi');
const {
  addBookHandler,
  getAllBooksHandler,
  getBookbyIdHandler,
  updateBookHandler,
  deleteBookHandler,

} = require('./handler');

const init = async () => {
  const server = Hapi.server({
    port: 9000,
    host: 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  server.route([
    {
      method: 'POST',
      path: '/books',
      handler: addBookHandler,
    },
    {
      method: 'GET',
      path: '/books',
      handler: getAllBooksHandler,
    },
    {
      method: 'GET',
      path: '/books/{bookId}',
      handler: getBookbyIdHandler,
    },
    {
      method: 'PUT',
      path: '/books/{bookId}',
      handler: updateBookHandler,
    },
    {
      method: 'DELETE',
      path: '/books/{bookId}',
      handler: deleteBookHandler,
    },
    {
      method: '*',
      path: '/{any*}',
      handler: (request, h) => {
        const response = h.response({
          status: 'fail',
          message: 'Halaman tidak ditemukan',
        });
        response.code(404);
        return response;
      },
    }
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();