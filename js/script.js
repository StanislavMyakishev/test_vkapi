if (Cookies.get('user_name')){
    $('.lead').html(writeHello(Cookies.get('user_name')));
}
    
if (localStorage.getItem('vk_friends_list') !== null){
    resp = JSON.parse(localStorage.getItem('vk_friends_list'));
    $('ul').html(drawAppearence(resp));
}
    
function drawAppearence(resp){
    let html = '';        
    let friends = {};
    if (resp !== null){
        if (resp.count !== 0){
        friends = resp.items;
            for (let i = 0; i < friends.length; ++i){
                let f = friends[i];
                html += `<li class="list-group-item d-flex justify-content-between align-items-center">
                        <a target="_blank" href="https://vk.com/id${f.id}">
                            <img class="friend-img" src="${f.photo_100}" />
                            <div class="friend-name">
                                <h4>${f.first_name} ${f.last_name}</h4>
                            </div>
                        </a>
                    </li>`;
            }
        } else {
            html += 'No added friends yet :(';
        }
        return html
    }
}
    
function writeHello(first_name){
    return `Привет, ${first_name}`;
}
    
$('.login-btn').click((event) =>{
    event.preventDefault();
    let friendsList;
    let promise = new Promise((resolve) => {
        VK.Auth.login((resp) => {
            Cookies.set('user_name', `${resp.session.user.first_name}`);
            $('p').html(writeHello(resp.session.user.first_name));
            let promise = new Promise((resolve) => {
                VK.Api.call('friends.search', {count: 5, fields: 'photo_100,online', v: '5.52'}, (resp) => {
                    let html = '';
                    html = drawAppearence(resp.response);
                    localStorage.setItem('vk_friends_list', JSON.stringify(resp.response));
                    resolve(html);
                });
            });
            promise
                .then(
                    html => {
                        $('.list-group').html(html);
                    }
                )
        }, VK.access.FRIENDS);
    })       
})
    
$('.logout-btn').click((event) =>{
    event.preventDefault();
    defaultLogoutResp = {};
    VK.Auth.logout((resp) => {
        localStorage.removeItem('vk_friends_list');
        Cookies.remove('user_name');
    })
    VK.Auth.revokeGrants((resp) => {
    })
    $('p').html('');
    $('ul').html('');
})