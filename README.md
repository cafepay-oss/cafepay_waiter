# CafePay waiter application

Staff use this Persian Vue 2 app to take table orders and send them to the kitchen.
Staff can also mark products as available or unavailable.
It uses the CafePay HTTP API and WebSocket updates.
The server controls cafe membership and staff permissions.

## Local setup

Follow the [backend setup guide](https://github.com/cafepay-oss/cafepal/blob/main/LOCAL_SETUP.md) first.
Keep `cafepal`, `cafepay-admin`, `cafepay-webapp`, and `cafepay_waiter` in one parent directory.
Complete the backend setup before starting the optional waiter service.
Then run these commands from `cafepal`:

```sh
docker compose --env-file .env.local -f compose.local.yml --profile waiter up -d --build waiter
```

Open [the local waiter application](http://localhost:3002).
The backend uses port `8000`; the administration application uses port `3001`.
Use a staff account with membership in the selected cafe.
The backend setup guide explains local accounts and sample data.
The waiter app needs users, tables, and menus from the backend.

## Web app development

The existing build uses Node `14.21.3`, npm `8.19.4`, and Vue CLI 4.
Use the Docker build to keep these versions consistent.
The old `node-sass` dependency can fail with newer Node releases or different processor types.

For local development with these versions, create an ignored `.env.local` file:

```dotenv
VUE_APP_CAFEPAY_BASE_URL=http://localhost:8000/
VUE_APP_CAFEPAY_SOCKET_URL=ws://localhost:8000/
```

Both values need their final `/`.
The client adds API paths and `ws/v1/` itself.
These public build values contain no authentication secrets.
Restart the development server or rebuild after changing them.

```sh
npm ci --legacy-peer-deps
npm run serve -- --port 3002
```

Build the deployable files with:

```sh
npm run build
```

The build writes `dist/`.
Configure the web server to return `index.html` for application routes, including `/table/:tableId`.
Use HTTPS and `wss://` addresses outside local development.

## Tests

Run the tests with Node 22 or later:

```sh
node --test tests/*.cjs
```

These tests need no dependency installation.
They cover failed order retries, cafe selection, route reloads, availability updates, request handling, and kitchen submission.
They simulate requests and do not send orders or print receipts.
Build the Docker image to check whether the complete app compiles.

## راهنمای کوتاه سالن‌دار

1. با شماره همراه حساب کارکنان وارد شوید.
2. فروشگاه خود را انتخاب کنید.
3. از فهرست میزها، میز مورد نظر را باز کنید.
4. محصول و تعداد را انتخاب کنید و سفارش را ثبت کنید.
5. در صورت خطا، پیام را بررسی کنید؛ تغییرات ثبت‌نشده برای تلاش دوباره باقی می‌مانند.
6. برای ارسال سفارش به آشپزخانه، از کنترل مربوط به آشپزخانه استفاده کنید.

ثبت سفارش آشپزخانه با چاپ رسید یکسان نیست.
چاپ به چاپگر فعال و تنظیمات فروشگاه نیاز دارد.
برای تنظیم چاپگر و عملیات مدیریتی، راهنمای فارسی مدیریت را بخوانید.

## Related repositories and limits

- [cafepal](https://github.com/cafepay-oss/cafepal): backend, Docker setup, local accounts, and sample data.
- [cafepay-admin](https://github.com/cafepay-oss/cafepay-admin): cafe management and the Persian staff guide.
- [cafepay-webapp](https://github.com/cafepay-oss/cafepay-webapp): customer ordering and the Persian customer guide.
- [cafepay-printer-driver](https://github.com/cafepay-oss/cafepay-printer-driver): desktop printing for the staff app.

The waiter code still calls the old printer service on port `38627`.
The current desktop printer app does not provide that service.
Use printer settings in the staff app for desktop printing.
This repository still uses old Vue and build dependencies.
The tests do not fully check browser behavior, scanners, or physical printers.

## License

CafePay code uses the [MIT License](LICENSE).
The app includes Vazirmatn v33.003 under the [SIL Open Font License 1.1](src/assets/fonts/OFL.txt).
See [the font notes](src/assets/fonts/README.md) for its source.
