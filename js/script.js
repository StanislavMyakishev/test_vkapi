if (Cookies.get('user_name')){
    $('p').html(writeHello(Cookies.get('user_name')));
}
    
if (localStorage.getItem('vk_friends_list') !== null){
    resp = JSON.parse(localStorage.getItem('vk_friends_list'));
    $('ul').html(drawAppearence(resp));
}
    
function drawAppearence(resp){
    let html = ''            
    let friends = {}
    if (resp !== null){
        if (resp.count !== 0){
        friends = resp.items
            for (let i = 0; i < friends.length; ++i){
                let f = friends[i];
                html += `<li>
                        <a target="_blank" href="https://vk.com/id${f.id}">
                            <img src="${f.photo_100}" />
                            <div>
                                <h4>${f.first_name} ${f.last_name}</h4>
                            </div>
                        </a>
                    </li>`
            }
        } else {
            html += 'No added friends yet :(';
        }
        console.log(html+'drawAppearance')
        return html
    }
}
    
function writeHello(first_name){
    return `Привет, ${first_name}`
}
    
$('#login').click((event) =>{
    event.preventDefault()
    let friendsList
    let promise = new Promise((resolve) => {
        VK.Auth.login((resp) => {
            Cookies.set('user_name', `${resp.session.user.first_name}`)
            $('p').html(writeHello(resp.session.user.first_name))
            let promise = new Promise((resolve) => {
                VK.Api.call('friends.search', {count: 5, fields: 'photo_100,online', v: '5.52'}, (resp) => {
                    let html = ''
                    html = drawAppearence(resp.response)
                    console.log(html+'call')
                    localStorage.setItem('vk_friends_list', JSON.stringify(resp.response))
                    resolve(html)
                })
            })
            promise
                .then(
                    html => {
                        console.log(html + 'click')
                        $('ul').html(html)
                    }
                )
        }, VK.access.FRIENDS)
    })       
})
    
$('#logout').click((event) =>{
    event.preventDefault()
    defaultLogoutResp = {}
    VK.Auth.logout((resp) => {
        localStorage.removeItem('vk_friends_list')
        Cookies.remove('user_name')
        console.log('everything is ok')
    })
    VK.Auth.revokeGrants((resp) => {
        console.log('you have loged out')  
    })
    $('p').html('')
    $('ul').html('')
})