# DESIGN CONCEPT

SimpleHOME Dashboard multi-webpage application

## Application pages

```text
SimpleHOME root/  --> domain "dashboard.hungthinhcloud.freeddns.org"
    login/  -->  Login page
    signup/  -->  Signup page
    home/  -->  Landing page
    dashboards/  -->  Dashboards page
    devices/  -->  Devices page
    rulechains/  -->  Rulechains page
    settings/  -->  Settings page
```

### root

There is nothing here, users will be directed to either login page or home page based on the authentication status.

### login page

Users can login with their username and password. There is also a link to the signup page. With a navigation bar containing a label linking to the homepage, a theme toggle button and a language toggle button.
See [SimpleHOME_Login.png](SimpleHOME_Login.png)

### signup page

Users can sign up with their username, email and password. There is also a link to the login page.
See [SimpleHOME_Signup.png](SimpleHOME_Signup.png)

### home page

The home page is the landing page if users try to access "dashboard.hungthinhcloud.freeddns.org". There will be a prompt-dialog appeared at the center of the screen in the first time loading the page, telling users to Login/Singup or continue browsing as a guest. If users choose to login/signup, they will be redirected to the login/signup page. If users choose to continue browsing as a guest (or simply close the floating dialog), they will be able to view the app SimpleHOME as a guest.

### dashboards page

The dashboards page is the page where all telemetry data will be displayed in the form of widgets. Based on user roles (admin/user/guest), users can view/edit/add/delete widgets. If user is admin, he can also create/delete dashboards. He can also assign dashboards to users/guests.

|Actions|Admins|Users|Guests|
|-|-|-|-|
|View dashboards|Yes|Yes|Yes|
|View widgets|Yes|Yes|Yes|
|Edit widgets|Yes|Limited|No|
|Add widgets|Yes|No|No|
|Delete widgets|Yes|No|No|
|Create dashboards|Yes|No|No|
|Delete dashboards|Yes|No|No|
|Assign dashboards to users|Yes|No|No|

### devices page

The devices page is the page where all devices will be displayed. Based on user roles (admin/user/guest), users can view/edit/add/delete devices. If user is admin, he can also create/delete devices.

|Actions|Admins|Users|Guests|
|-|-|-|-|
|View devices|Yes|Yes|Yes|
|Edit devices|Yes|Limited|No|
|Add devices|Yes|No|No|
|Delete devices|Yes|No|No|

### rulechains page

The rulechains page is the page where all rulechains will be displayed. Based on user roles (admin/user/guest), users can view/edit/add/delete rulechains. If user is admin, he can also create/delete rulechains.

|Actions|Admins|Users|Guests|
|-|-|-|-|
|View rulechains|Yes|Yes|Yes|
|Edit rulechains|Yes|Limited|No|
|Add rulechains|Yes|No|No|
|Delete rulechains|Yes|No|No|

Full Edit rulechains rules:

|Action|Attributes|Admins|Users|Guests|
|-|-|-|-|-|
|Edit|Name|Yes|No|No|
||Description|Yes|Yes|No|
||Lable|Yes|No|No|
||Telemetry datakey|Yes|No|No|
||Enable state|Yes|Yes|No|


### settings page

The settings page is the page where all settings will be displayed. Based on user roles (admin/user/guest), users can view/edit settings.

|Actions|Admins|Users|Guests|
|-|-|-|-|
|View settings|Yes|Yes|Yes|
|Edit settings|Yes|Limited|No|

Full settings options:

|Setting|Actions|Admins|Users|Guests|
|-|-|-|-|-|
|Account settings|Change display name|Yes|Yes|No|
||Change username|Yes|Yes|No|
||Change password|Yes|Yes|No|
||Change email|Yes|Yes|No|
||Assign roles|Yes|No|No|
|Notification settings|Enable notifications|Yes|Yes|Yes|
||Enable notification ringbell|Yes|Yes|Yes|
||Enable push notifications|Yes|Yes|Yes|
||Enable Email notifications|Yes|Yes|No|
|Languages and Themes settings|Change language|Yes|Yes|Yes|
||Change theme|Yes|Yes|Yes|
||Change local time|Yes|Yes|No|
||Change location|Yes|Yes|No|



