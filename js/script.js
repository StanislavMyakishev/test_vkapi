/*jshint esversion: 9 */

if (getCookie("auth_cookie")) {
  $(".lead").html(writeHello(getCookie("auth_cookie")));
  $(".logout-btn").css("display", "initial");
  let resp = JSON.parse(getCookie("auth_cookie"));
  $(".list-group").html(drawFriendsList(resp));
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

      html += `<li class="list-group-item d-flex justify-content-between align-items-center">
                    <a target="_blank" href="https://vk.com/id${f.id}">
                        <div class="list-elem">
                            <img class="list-elems friend-img" src="${f.photo_100}"/>
                            <h4 class="list-elems friend-text">${f.first_name} ${f.last_name}</h4>
                            <p style="font-weight:1vh;" class="online-status">${online}
                                <img src="/css/static/phone_iphone.svg" alt="smartphone icon"/>
                            </p>
                        </div>
                    </a>
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

      let promise = new Promise(resolve => {
        VK.Api.call(
          "friends.search", { count: 5, fields: "photo_100,online", v: "5.52"}, resp => {
            let html = "";
            html = drawFriendsList(resp.response.items);
            setCookie("auth_cookie", `${JSON.stringify(resp.response.items)}`, {
              samesite: true,
              "max-age": 3600
            });
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
  deleteCookie("user_name");
  VK.Auth.logout();
  VK.Auth.revokeGrants();
  $(".logout-btn").css("display", "none");
  $(".login-btn").css("display", "initial");
  $(".lead").html("Авторизируйтесь, чтобы увидеть 5 самых важных друзей во ВКонтакте!");
  $("ul").html("");
});
