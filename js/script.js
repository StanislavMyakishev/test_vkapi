/*jshint esversion: 9 */

if (getCookie("auth_cookie")) {
  $(".lead").html(writeHello(getCookie("auth_cookie").replace(/"/g, '')));
  $(".logout-btn").css("display", "initial");
  if (getCookie("friends_list_cookie")) {
    $(".list-group").html(
      drawFriendsList(JSON.parse(getCookie("friends_list_cookie")))
    );
  } else {
    $(".list-group").html(drawFriendsList({}));
  }
} else {
  deleteCookie("user_name");
  $(".login-btn").css("display", "initial");
}

function getCookie(name) {
  let matches = document.cookie.match(
    new RegExp(
      "(?:^|; )" +
        name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
        "=([^;]*)"
    )
  );

  return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie(name, value, options = {}) {
  options = {
    path: "/",
    ...options
  };

  let updatedCookie =
    encodeURIComponent(name) + "=" + encodeURIComponent(value);

  for (let optionKey in options) {
    updatedCookie += "; " + optionKey;
    let optionValue = options[optionKey];
    if (optionValue !== true) {
      updatedCookie += "=" + optionValue;
    }
  }

  document.cookie = updatedCookie;
}

function deleteCookie(name) {
  setCookie(name, "", {
    "max-age": -1
  });
}

function drawFriendsList(friendsList) {
  let html = "";

  if (friendsList.length !== 0) {
    for (let i = 0; i < friendsList.length; ++i) {
      let f = friendsList[i];
      let online = "";
      let mobile = "none";

      if (f.online === 1) {
        online = "Online";
      }

      if (f.online_mobile === 1) {
        mobile = "initial";
      }

      html += `<li class="media list-group-item d-flex justify-content-between align-items-center">
                <div class="list-elem">
                  <img class="align-self-center mr-3 list-elems friend-img" src="${f.photo_100}"/>
                    <div class="media-body">
                      <a target="_blank" href="https://vk.com/id${f.id}">
                        <h4 class="list-elems friend-text">${f.first_name} ${f.last_name}</h4>
                      </a>
                      <p style="font-weight:1vh;" class="mt-0">${online}
                          <img style="height:15px;display:${mobile};" src="./css/static/phone_iphone.svg" alt="smartphone icon"/>
                      </p>
                    </div>
                  </div>
              </li>`;
    }
  } else {
    html += `<li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <p style="font-weight:1vh;" class="online-status">
                        Пока что в Вашем списке друзей пусто :(
                    </p>
                </div>
            </li>`;
  }
  return html;
}

function writeHello(first_name) {
  return `Привет, ${first_name}`;
}

$(".login-btn").click(event => {
  event.preventDefault();

  VK.Auth.login(resp => {
    if (resp.session) {
      $(".logout-btn").css("display", "initial");
      $(".login-btn").css("display", "none");
      $(".lead").html(writeHello(resp.session.user.first_name));
      setCookie(
        "auth_cookie",
        `${JSON.stringify(resp.session.user.first_name)}`,
        { samesite: true, "max-age": 3600 }
      );
      let promise = new Promise(resolve => {
        VK.Api.call(
          "friends.search",
          { count: 5, fields: "photo_100,online", v: "5.52" },
          resp => {
            let html = "";
            html = drawFriendsList(resp.response.items);
            setCookie(
              "friends_list_cookie",
              `${JSON.stringify(resp.response.items)}`,
              { samesite: true, "max-age": 3600}
            );
            resolve(html);
          }
        );
      });

      promise.then(html => {
        $(".list-group").html(html);
      });
    } else {
      $(".lead").html("Пожалуйста, авторизуйтесь через сервис ВКонтакте.");
    }
  }, VK.access.FRIENDS);
});

$(".logout-btn").click(event => {
  event.preventDefault();
  deleteCookie("auth_cookie");
  deleteCookie('friends_list_cookie');
  VK.Auth.logout();
  VK.Auth.revokeGrants();
  $(".logout-btn").css("display", "none");
  $(".login-btn").css("display", "initial");
  $(".lead").html(
    "Авторизируйтесь, чтобы увидеть 5 самых важных друзей во ВКонтакте!"
  );
  $("ul").html("");
});
