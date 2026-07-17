# Demo Guide: Daily Expense & Income Diary

This document shows how to demo the new diary functionality from both:
- Browser UI (frontend flow)
- Console (API flow with curl)

## 1. Prerequisites

- Node.js 20.x
- npm
- MongoDB running and reachable by the API env config

Install dependencies:

```sh
cd Api && npm install
cd ../FrontEnd && npm install
```

## 2. Start The Application

Open two terminals from the repository root.

Terminal A (API):

```sh
cd Api
npm run start
```

Expected output includes:
- Server running on port 4000
- [MongoDB] CONNECTED!

Terminal B (Frontend):

```sh
cd FrontEnd
npm run dev
```

Open the UI at:
- http://localhost:3000

## 3. Browser Demo Steps

### 3.1 Login

Use this demo account:
- Email: test@meblabs.com
- Password: testtest

If the account does not exist in your local DB, create it from console first (see section 5.1).

After successful login, you should land on the diary dashboard.

### 3.2 Show Read/List

On the home page, show:
- Summary cards (Income, Expense, Balance)
- Transaction table
- Type filter dropdown
- Search input for category/description

Click Refresh to show data reload behavior.

### 3.3 Show Create

Click Add and create an entry such as:
- Type: expense
- Category: groceries
- Amount: 35.20
- Date: today
- Description: weekly shopping

Submit and confirm the new row appears.

### 3.4 Show Update

Edit the row you just created:
- Change amount or description

Save and confirm the table updates.

### 3.5 Show Delete

Delete the same row.

Confirm:
- Row is removed from the table
- Summary values update accordingly

## 4. Console Demo Steps (API)

Run these from the repository root or Api folder.

### 4.1 Authenticate and store cookies

```sh
curl -i -c /tmp/diary.cookies -b /tmp/diary.cookies \
  -H 'Content-Type: application/json' \
  -X POST http://localhost:4000/auth/login \
  -d '{"email":"test@meblabs.com","password":"testtest"}'
```

Expected:
- HTTP 200
- Set-Cookie headers for accessToken and refreshToken

### 4.2 Create transaction

```sh
curl -s -c /tmp/diary.cookies -b /tmp/diary.cookies \
  -H 'Content-Type: application/json' \
  -X POST http://localhost:4000/transactions \
  -d '{"type":"expense","amount":12.5,"category":"coffee","date":"2026-07-17","description":"team coffee"}'
```

Copy the returned _id as TX_ID.

### 4.3 List transactions

```sh
curl -s -c /tmp/diary.cookies -b /tmp/diary.cookies \
  'http://localhost:4000/transactions?sorter=-date'
```

Expected:
- Response includes the created transaction

### 4.4 Read one transaction

```sh
curl -s -c /tmp/diary.cookies -b /tmp/diary.cookies \
  http://localhost:4000/transactions/TX_ID
```

Replace TX_ID with the id from step 4.2.

### 4.5 Update transaction

```sh
curl -s -c /tmp/diary.cookies -b /tmp/diary.cookies \
  -H 'Content-Type: application/json' \
  -X PUT http://localhost:4000/transactions/TX_ID \
  -d '{"amount":15.75,"description":"coffee and snack"}'
```

Expected:
- Updated amount/description in response

### 4.6 Delete transaction

```sh
curl -s -c /tmp/diary.cookies -b /tmp/diary.cookies \
  -X DELETE http://localhost:4000/transactions/TX_ID
```

Expected:
- Success response
- Item no longer present in list endpoint

## 5. Support Commands

### 5.1 Create a local demo user (only if login fails with wrong email)

```sh
curl -s -X POST http://localhost:4000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@meblabs.com","password":"testtest","name":"John","lastname":"Doe","lang":"en"}'
```

If login then fails with inactive account, activate it:

```sh
cd Api
node -r dotenv/config -e 'const mongoose=require("mongoose"); const config=require("./db/config"); const User=require("./models/user"); const {MONGO_DATABASE_USERNAME,MONGO_DATABASE_PASSWORD,MONGO_DATABASE_HOST,MONGO_DATABASE_NAME}=process.env; const url="mongodb://"+MONGO_DATABASE_USERNAME+":"+MONGO_DATABASE_PASSWORD+"@"+MONGO_DATABASE_HOST+":27017/"+MONGO_DATABASE_NAME; (async()=>{await mongoose.set("strictQuery",false).connect(url,config); await User.updateOne({email:"test@meblabs.com"},{"$set":{active:true,deleted:false}}); console.log("Activated test@meblabs.com"); await mongoose.disconnect();})();'
```

### 5.2 Quick health checks

```sh
curl -s http://localhost:4000/
curl -s -o /tmp/rt.out -w "%{http_code}" http://localhost:4000/auth/rt && echo && cat /tmp/rt.out
```

Expected:
- / returns alive message
- /auth/rt returns 401 with refresh-token unauthorized payload when not logged in

## 6. Troubleshooting

- Spinner never leaves loading screen:
  - Restart API and frontend dev servers.
  - Verify /auth/check and /auth/rt responses from the API.

- Login says wrong email:
  - Create the demo user with section 5.1.

- Login says inactive account:
  - Run activation command in section 5.1.

- Frontend cannot reach API:
  - Confirm FrontEnd/.env points to http://localhost:4000.
  - Confirm API is listening on port 4000.
