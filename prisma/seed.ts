import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Create sample authors
  const author1 = await prisma.author.upsert({
    where: { firstName_lastName: { firstName: 'J.K.', lastName: 'Rowling' } },
    update: {},
    create: {
      firstName: 'J.K.',
      lastName: 'Rowling',
    },
  });

  const author2 = await prisma.author.upsert({
    where: { firstName_lastName: { firstName: 'George', lastName: 'Orwell' } },
    update: {},
    create: {
      firstName: 'George',
      lastName: 'Orwell',
    },
  });

  const author3 = await prisma.author.upsert({
    where: { firstName_lastName: { firstName: 'Stephen', lastName: 'King' } },
    update: {},
    create: {
      firstName: 'Stephen',
      middleName: 'Edwin',
      lastName: 'King',
    },
  });

  const author4 = await prisma.author.upsert({
    where: {
      firstName_lastName: { firstName: 'Agatha', lastName: 'Christie' },
    },
    update: {},
    create: {
      firstName: 'Agatha',
      lastName: 'Christie',
    },
  });

  // Create sample genres
  const fantasyGenre = await prisma.genre.upsert({
    where: { name: 'Fantasy' },
    update: {},
    create: {
      name: 'Fantasy',
      description: 'Fantasy fiction with magical elements',
    },
  });

  const dystopianGenre = await prisma.genre.upsert({
    where: { name: 'Dystopian' },
    update: {},
    create: {
      name: 'Dystopian',
      description: 'Dystopian and science fiction',
    },
  });

  const horrorGenre = await prisma.genre.upsert({
    where: { name: 'Horror' },
    update: {},
    create: {
      name: 'Horror',
      description: 'Horror and thriller fiction',
    },
  });

  const mysteryGenre = await prisma.genre.upsert({
    where: { name: 'Mystery' },
    update: {},
    create: {
      name: 'Mystery',
      description: 'Mystery and detective fiction',
    },
  });

  // Create sample locations
  const location1 = await prisma.location.upsert({
    where: { name: 'Fiction Section A' },
    update: {},
    create: {
      name: 'Fiction Section A',
      floor: 1,
      section: 'A',
      description: 'Main fiction collection',
    },
  });

  const location2 = await prisma.location.upsert({
    where: { name: 'Classic Literature' },
    update: {},
    create: {
      name: 'Classic Literature',
      floor: 2,
      section: 'B',
      description: 'Classic and historical literature',
    },
  });

  const location3 = await prisma.location.upsert({
    where: { name: 'Horror Section' },
    update: {},
    create: {
      name: 'Horror Section',
      floor: 1,
      section: 'C',
      description: 'Horror and thriller books',
    },
  });

  const location4 = await prisma.location.upsert({
    where: { name: 'Mystery Section' },
    update: {},
    create: {
      name: 'Mystery Section',
      floor: 2,
      section: 'D',
      description: 'Mystery and detective novels',
    },
  });

  // Create sample books
  const book1 = await prisma.book.upsert({
    where: {
      title_authorId_edition_publisher: {
        title: "Harry Potter and the Philosopher's Stone",
        authorId: author1.id,
        edition: '1st Edition',
        publisher: 'Bloomsbury',
      },
    },
    update: {},
    create: {
      title: "Harry Potter and the Philosopher's Stone",
      authorId: author1.id,
      locationId: location1.id,
      publishedAt: new Date('1997-06-26'),
      edition: '1st Edition',
      publisher: 'Bloomsbury',
      isbn: '9780747532699',
      pageCount: 223,
    },
  });

  const book2 = await prisma.book.upsert({
    where: {
      title_authorId_edition_publisher: {
        title: 'Harry Potter and the Chamber of Secrets',
        authorId: author1.id,
        edition: '1st Edition',
        publisher: 'Bloomsbury',
      },
    },
    update: {},
    create: {
      title: 'Harry Potter and the Chamber of Secrets',
      authorId: author1.id,
      locationId: location1.id,
      publishedAt: new Date('1998-07-02'),
      edition: '1st Edition',
      publisher: 'Bloomsbury',
      isbn: '9780747538493',
      pageCount: 251,
    },
  });

  const book3 = await prisma.book.upsert({
    where: {
      title_authorId_edition_publisher: {
        title: '1984',
        authorId: author2.id,
        edition: 'Penguin Classics',
        publisher: 'Penguin Books',
      },
    },
    update: {},
    create: {
      title: '1984',
      authorId: author2.id,
      locationId: location2.id,
      publishedAt: new Date('1949-06-08'),
      edition: 'Penguin Classics',
      publisher: 'Penguin Books',
      isbn: '9780140817744',
      pageCount: 328,
    },
  });

  const book4 = await prisma.book.upsert({
    where: {
      title_authorId_edition_publisher: {
        title: 'Animal Farm',
        authorId: author2.id,
        edition: 'Standard Edition',
        publisher: 'Secker & Warburg',
      },
    },
    update: {},
    create: {
      title: 'Animal Farm',
      authorId: author2.id,
      locationId: location2.id,
      publishedAt: new Date('1945-08-17'),
      edition: 'Standard Edition',
      publisher: 'Secker & Warburg',
      isbn: '9780451526342',
      pageCount: 112,
    },
  });

  const book5 = await prisma.book.upsert({
    where: {
      title_authorId_edition_publisher: {
        title: 'The Shining',
        authorId: author3.id,
        edition: '1st Edition',
        publisher: 'Doubleday',
      },
    },
    update: {},
    create: {
      title: 'The Shining',
      authorId: author3.id,
      locationId: location3.id,
      publishedAt: new Date('1977-01-28'),
      edition: '1st Edition',
      publisher: 'Doubleday',
      isbn: '9780385121675',
      pageCount: 447,
    },
  });

  const book6 = await prisma.book.upsert({
    where: {
      title_authorId_edition_publisher: {
        title: 'Murder on the Orient Express',
        authorId: author4.id,
        edition: 'Harper Paperback',
        publisher: 'HarperCollins',
      },
    },
    update: {},
    create: {
      title: 'Murder on the Orient Express',
      authorId: author4.id,
      locationId: location4.id,
      publishedAt: new Date('1934-01-01'),
      edition: 'Harper Paperback',
      publisher: 'HarperCollins',
      isbn: '9780062693662',
      pageCount: 256,
    },
  });

  // Create book-genre relationships
  // Harry Potter books - Fantasy
  await prisma.bookGenre.upsert({
    where: {
      bookId_genreId: {
        bookId: book1.id,
        genreId: fantasyGenre.id,
      },
    },
    update: {},
    create: {
      bookId: book1.id,
      genreId: fantasyGenre.id,
    },
  });

  await prisma.bookGenre.upsert({
    where: {
      bookId_genreId: {
        bookId: book2.id,
        genreId: fantasyGenre.id,
      },
    },
    update: {},
    create: {
      bookId: book2.id,
      genreId: fantasyGenre.id,
    },
  });

  // Orwell books - Dystopian
  await prisma.bookGenre.upsert({
    where: {
      bookId_genreId: {
        bookId: book3.id,
        genreId: dystopianGenre.id,
      },
    },
    update: {},
    create: {
      bookId: book3.id,
      genreId: dystopianGenre.id,
    },
  });

  await prisma.bookGenre.upsert({
    where: {
      bookId_genreId: {
        bookId: book4.id,
        genreId: dystopianGenre.id,
      },
    },
    update: {},
    create: {
      bookId: book4.id,
      genreId: dystopianGenre.id,
    },
  });

  // Stephen King - Horror
  await prisma.bookGenre.upsert({
    where: {
      bookId_genreId: {
        bookId: book5.id,
        genreId: horrorGenre.id,
      },
    },
    update: {},
    create: {
      bookId: book5.id,
      genreId: horrorGenre.id,
    },
  });

  // Agatha Christie - Mystery
  await prisma.bookGenre.upsert({
    where: {
      bookId_genreId: {
        bookId: book6.id,
        genreId: mysteryGenre.id,
      },
    },
    update: {},
    create: {
      bookId: book6.id,
      genreId: mysteryGenre.id,
    },
  });

  console.log('Seeding finished.');
  console.log(`Created ${await prisma.author.count()} authors`);
  console.log(`Created ${await prisma.genre.count()} genres`);
  console.log(`Created ${await prisma.location.count()} locations`);
  console.log(`Created ${await prisma.book.count()} books`);
  console.log(
    `Created ${await prisma.bookGenre.count()} book-genre relationships`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
