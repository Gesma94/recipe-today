# Recipe Today

TODO

### Authentication

#### `/authenticate` route
When user opens the website, he firsts call the `/authenticate` route.
This call will try to authenticate the user:
- First, it tries to use the access token in a http-only cookie;
- If the access token is expired, it tries to use the refresh token, again in an http-only cookie;
- If one of the previous operation succeed, the user get back his data;
- Otherwise, a 401 status code is returned, and the user will be redirected to the login page;