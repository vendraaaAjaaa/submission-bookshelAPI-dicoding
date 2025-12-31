const { nanoid } = require('nanoid');
const books = require('./books');

const validateBookData = (book, isUpdate = false) => {
  const { name, pageCount, readPage } = book;

  if (!book) {
    const action = isUpdate ? 'memperbarui' : 'menambahkan';
    return { isValid: false, message: `Gagal ${action} buku. Data tidak valid` };
  }

  if (!name || name.trim() === '') {
    const action = isUpdate ? 'memperbarui' : 'menambahkan';
    return { isValid: false, message: `Gagal ${action} buku. Mohon isi nama buku` };
  }

  const pageCountNum = Number(pageCount);
  const readPageNum = Number(readPage);

  if (readPageNum > pageCountNum) {
    const action = isUpdate ? 'memperbarui' : 'menambahkan';
    return { isValid: false, message: `Gagal ${action} buku. readPage tidak boleh lebih besar dari pageCount` };
  }
  return { isValid: true };
};

const addBookHandler = (request, h) => {
  const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

  const validationBookData = validateBookData(request.payload, false);

  if (!validationBookData.isValid) {
    const response = h.response({
      status: 'fail',
      message: validationBookData.message,
    });
    response.code(400);
    return response;
  }

  const id = nanoid(16);
  const insertedAt = new Date().toISOString();
  const finished = pageCount === readPage;
  const updatedAt = insertedAt;

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  books.push(newBook);

  const isSuccess = books.filter((book) => book.id === id).length > 0;

  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }

  const response = h.response({
    status: 'error',
    message: 'Buku gagal ditambahkan',
  });
  response.code(500);
  return response;
};

const getAllBooksHandler = (request, h) => {
  const { name, reading, finished } = request.query;
  let filteredBooks = books;

  if (name !== undefined) {
    filteredBooks = filteredBooks.filter((book) => book.name.toLowerCase().includes(name.toLowerCase()));
  }

  if (reading !== undefined) {
    const isReading = reading === '1';
    filteredBooks = filteredBooks.filter((book) => book.reading === isReading);
  }

  if (finished !== undefined) {
    const isFinished = finished === '1';
    filteredBooks = filteredBooks.filter((book) => book.finished === isFinished);
  }

  const response = h.response({
    status: 'success',
    data: {
      books: filteredBooks.map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      })),
    },
  });
  response.code(200);
  return response;
};

const getBookbyIdHandler = (request, h) => {
  const { bookId } = request.params;

  const book = books.find((b) => b.id === bookId);

  if (book !== undefined) {
    return {
      status: 'success',
      data: {
        book,
      },
    };
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);
  return response;
};

const updateBookHandler = (request, h) => {
  const { bookId } = request.params;
  const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

  if (!request.payload) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Data tidak valid',
    });
    response.code(400);
    return response;
  }

  const validationBookData = validateBookData(request.payload, true);

  if (!validationBookData.isValid) {
    const response = h.response({
      status: 'fail',
      message: validationBookData.message,
    });
    response.code(400);
    return response;
  }

  const index = books.findIndex((book) => book.id === bookId);

  if (index === -1) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Id tidak ditemukan',
    });
    response.code(404);
    return response;
  }
  const updatedAt = new Date().toISOString();
  const finished = pageCount === readPage;

  books[index] = {
    ...books[index],
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    updatedAt,
  };

  const response = h.response({
    status: 'success',
    message: 'Buku berhasil diperbarui',
  });
  response.code(200);
  return response;
};

const deleteBookHandler = (request, h) => {
  const { bookId } = request.params;

  const index = books.findIndex((book) => book.id === bookId);

  if (index !== -1) {
    books.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }
  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

module.exports = { addBookHandler, getAllBooksHandler, getBookbyIdHandler, updateBookHandler, deleteBookHandler };