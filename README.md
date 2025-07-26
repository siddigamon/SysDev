# Library Management API

A practical library management system built with NestJS, Prisma, and PostgreSQL. Handles books, authors, genres, and locations with realistic status tracking.

## What This Does

Manages library operations the way they actually work:

- Books have statuses (available, checked out, damaged, lost, etc.)
- Locations can be active or temporarily closed
- Authors and genres stay simple
- Nothing gets permanently deleted - books get retired, locations get deactivated

## Getting Started

**Requirements:**

- Node.js 18+
- PostgreSQL
- npm

**Setup:**

```bash
git clone <repository-url>
cd sysdev-library-api
npm install
```

**Environment file (.env):**

```env
DATABASE_URL="postgresql://username:password@localhost:5432/library_db"
PORT=3000
```

**Database:**

```bash
npx prisma migrate deploy
npx prisma generate
npm run db:seed
```

**Run:**

```bash
npm run start:dev
```

API runs at `http://localhost:3000`

## API Endpoints

### Books

```http
POST   /books                    # Create book
GET    /books                    # List books (with filters)
GET    /books/:id                # Get one book
PATCH  /books/:id                # Update book info
DELETE /books/:id                # Retire book

# Status changes
PATCH  /books/:id/check-out      # Check out
PATCH  /books/:id/check-in       # Return
PATCH  /books/:id/mark-lost      # Mark lost
PATCH  /books/:id/mark-damaged   # Mark damaged
PATCH  /books/:id/send-to-repair # Send to repair
PATCH  /books/:id/move-to-storage # Move to storage
PATCH  /books/:id/status         # Change status directly

# Quick filters
GET    /books/available          # Available books only
GET    /books/checked-out        # Checked out books only
```

### Filtering Books

```http
GET /books?status=AVAILABLE                    # By status
GET /books?authorId=1                          # By author
GET /books?genreId=2                           # By genre
GET /books?locationId=3                        # By location
GET /books?includeRetired=true                 # Include retired books

# Combine filters
GET /books?status=AVAILABLE&locationId=1       # Available in location 1
GET /books?authorId=3&includeRetired=true      # All books by author 3
GET /books?genreId=4&status=CHECKED_OUT        # Checked out books in genre 4
```

### Authors

```http
POST   /authors          # Create
GET    /authors          # List all
GET    /authors/:id      # Get one
PATCH  /authors/:id      # Update
DELETE /authors/:id      # Delete (only if no books)
```

### Genres

```http
POST   /genres           # Create
GET    /genres           # List all
GET    /genres/:id       # Get one
PATCH  /genres/:id       # Update
DELETE /genres/:id       # Delete (only if no books)
```

### Locations

```http
POST   /locations                    # Create
GET    /locations                    # List active only
GET    /locations?includeInactive=true # Include inactive
GET    /locations?status=ACTIVE      # Filter by status
GET    /locations/:id                # Get one
PATCH  /locations/:id                # Update
PATCH  /locations/:id/deactivate     # Deactivate
PATCH  /locations/:id/activate       # Activate
DELETE /locations/:id                # Deactivate
```

## Example Usage

### Basic Book Operations

```bash
# Create a book
POST /books
{
  "title": "1984",
  "authorId": 1,
  "genreIds": [1, 2],
  "locationId": 1,
  "publishedAt": "1949-06-08",
  "isbn": "9780140817744"
}

# Check it out
PATCH /books/1/check-out
{
  "reason": "Borrowed by student"
}

# Return it
PATCH /books/1/check-in

# Report damage
PATCH /books/1/mark-damaged
{
  "reason": "Water damage on cover"
}
```

### Common Queries

```bash
# What's available to borrow?
GET /books/available

# What's checked out?
GET /books/checked-out

# Available books in fiction section
GET /books?status=AVAILABLE&locationId=1

# All Stephen King books (including retired)
GET /books?authorId=3&includeRetired=true

# Horror books currently checked out
GET /books?genreId=4&status=CHECKED_OUT
```

### Real-World Scenarios

**Morning library routine:**

```bash
GET /books?status=DAMAGED         # Books needing attention
GET /books?status=LOST           # Books to investigate
GET /books?status=IN_REPAIR      # Books expected back from repair
```

**Patron assistance:**

```bash
GET /books?authorId=3&status=AVAILABLE      # Available Stephen King books
GET /books?genreId=1&locationId=2           # Fantasy books in specific section
```

**Inventory management:**

```bash
GET /books?locationId=1&includeRetired=false   # Active books in Fiction Section A
GET /locations?status=INACTIVE                 # Sections temporarily closed
```

### Database Structure

- Authors can have many books
- Books belong to one author and one location
- Books can have multiple genres (many-to-many relationship)
- Everything uses proper foreign keys for data integrity

### Key Features

- **Soft deletes**: Books get "retired", locations get "deactivated"
- **Status tracking**: Every status change includes reason and timestamp
- **Combined filtering**: Mix and match any query parameters
- **Entity validation**: Checks that referenced authors/genres/locations exist
- **Referential integrity**: Can't delete authors/genres that have associated books

## Sample Data

Run `npm run db:seed` to get:

- 4 authors (Rowling, Orwell, King, Christie)
- 4 genres (Fantasy, Dystopian, Horror, Mystery)
- 5 locations (different sections)
- 8 books with various statuses for testing

## Development Commands

```bash
npm run start:dev          # Development with hot reload
npm run build              # Build for production
npm run db:seed            # Add sample data
npm run db:reset-seed      # Fresh database with sample data
npx prisma studio          # Visual database browser
npm run lint               # Check code style
```

## API Responses

**Success (creating a book):**

```json
{
  "id": 1,
  "title": "1984",
  "status": "AVAILABLE",
  "statusReason": "Available for checkout",
  "statusDate": "2024-01-26T10:30:00.000Z",
  "author": {
    "firstName": "George",
    "lastName": "Orwell"
  },
  "location": {
    "name": "Fiction Section A",
    "status": "ACTIVE"
  },
  "bookGenres": [
    {
      "genre": {
        "name": "Dystopian",
        "description": "Dystopian fiction"
      }
    }
  ]
}
```

**Validation Error:**

```json
{
  "message": [
    "Book title must be a valid text string",
    "Every book needs a title - please provide one"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

**Not Found Error:**

```json
{
  "message": "Book with ID 999 not found",
  "error": "Not Found",
  "statusCode": 404
}
```

**Referential Integrity Error:**

```json
{
  "message": "Cannot delete author with 5 books. Authors with published works cannot be removed to maintain catalog integrity.",
  "error": "Conflict",
  "statusCode": 409
}
```

**Data Integrity:**

- Soft deletes preserve historical data
- Foreign key constraints prevent orphaned records
- Unique constraints prevent
