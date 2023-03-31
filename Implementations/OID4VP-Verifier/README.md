# OID4VP-Verifier

## Start the verifier service

- add a .env file with the following structure

```
HOST=https://91cb-91-67-75-98.eu.ngrok.io
PORT=8001
WALLET_HOST=openid://
CREDENTIAL_TTL=300000
```
- start the verifier by running

```bash
npm i
npm start
```

## Test the verifier service

Option 1: Curl


open a new terminal and type 

```
curl --location --request GET 'http://localhost:8001/auth'
```

A response like the one below should be returned

```
openid://?client_id=https%3A%2F%2Fdbc4-91-67-75-98.eu.ngrok.io%2Fauth%2F&request_uri=https%3A%2F%2Fdbc4-91-67-75-98.eu.ngrok.io%2Fauth%2F45a05ef0-4057-4da4-b731-300ec3bef547%   
```

Usually a Wallet would resolve the reponse and download the auth request object from the url specified in the request_uri param. To test without a wallet, copy the url specified in the request uri param and decode it to an url-unsafe- url. You could use an online url decoder or use the console in developer tools of your browser. 

type:
```
decodeURIComponent("https%3A%2F%2Fdbc4-91-67-75-98.eu.ngrok.io%2Fauth%2F45a05ef0-4057-4da4-b731-300ec3bef547")
```

In a browser open the returned link e.g.
https://dbc4-91-67-75-98.eu.ngrok.io/auth/45a05ef0-4057-4da4-b731-300ec3bef547

This should return the auth request object as an jwt. You could use jwt.io to get the jwts content.

To send a presentation you could use the curl request below.

```
curl --location --request POST 'http://localhost:8001/verify' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'vp_token=eyJhbGciOiAiRVMyNTYifQ.eyJpc3MiOiAiZGlkOmp3azpleUpyZEhraU9pSkZReUlzSW1OeWRpSTZJbEF0TWpVMklpd2llQ0k2SW1JeU9HUTBUWGRhVFdwM09DMHdNRU5ITkhobWJtNDVVMHhOVmsxTk1UbFRiSEZhY0ZaaVgzVk9kRkVpTENKNUlqb2lXSFkxZWxkM2RXOWhWR2RrVXpab1ZqUXplVWsyWjBKM1ZHNXFkV3R0UmxGUmJrcGZhME40ZW5Gck9DSjkiLCAiaWF0IjogMTY3NzU2ODIwNywgImV4cCI6IDE2ODUyNTQyMDcsICJ0eXBlIjogIlZlcmlmaWVkRU1haWwiLCAiY3JlZGVudGlhbFN1YmplY3QiOiB7Il9zZCI6IFsiNlBuX3MtUk1HQTN2VVpNVXhjV0VoYmF6YjFFRTNDaGtFSEkxUGtVMThCbyIsICJLN084eDBfdnhyYzM3LUJTWWxxelpCMTVsUTBSaTlCc0xjN2dkRnhqeWtZIiwgIlBDeFFIRktjeXMwaVNCQ1Z3UjFNaklSLXJzUFIxX25LbEpDYURCRzA4TzgiXX0sICJfc2RfYWxnIjogInNoYS0yNTYiLCAiY25mIjogeyJqd2siOiB7Imt0eSI6ICJFQyIsICJjcnYiOiAiUC0yNTYiLCAieCI6ICJUQ0FFUjE5WnZ1M09IRjRqNFc0dmZTVm9ISVAxSUxpbERsczd2Q2VHZW1jIiwgInkiOiAiWnhqaVdXYlpNUUdIVldLVlE0aGJTSWlyc1ZmdWVjQ0U2dDRqVDlGMkhaUSJ9fX0.wIDs3Uq6RI1DoBI-ZzrahxEolOgpPLOyXFz81qsggUVvCehJNQ2EDQZfCC_mM1PFpHcEfWREwW14D4_2VgDp3g~WyIzSldySXhpeEw4Vmt1Q2RqLW0wZUNRIiwgImVtYWlsIiwgInRlc3RAZXhhbXBsZS5jb20iXQ~eyJhbGciOiAiRVMyNTYifQ.eyJub25jZSI6ICJYWk9VY28xdV9nRVBrbnhTNzhzV1dnIiwgImF1ZCI6ICJodHRwczovL2V4YW1wbGUuY29tL3ZlcmlmaWVyIiwgImlhdCI6IDE2Nzc2MDQ3MzV9.90RK_SzrxnWGRROrFhKkQVnsuT2mvYgNImYRthXe3BW9x0pvzL563y5G8BFUWHV1E0nQ5L6Swvn6TmplJK2BAg'
```


1. (Recommended) Wallet: you can also test the verifier service with a Wallet App, which supports OID4VC (cross device flow). Create a QRCode with the auth request response as its data.