const APIURL = 'https://api.github.com/users/'

const main = document.getElementById('main')
const form = document.getElementById('form')
const search = document.getElementById('search')

// Dışarıdan gelen veriler yalnızca textContent ile yazılır (XSS koruması).
function element(tag, className, text) {
    const node = document.createElement(tag)
    if (className) node.className = className
    if (text !== undefined && text !== null) node.textContent = text
    return node
}

async function getJSON(url) {
    const response = await fetch(url)
    if (!response.ok) {
        const error = new Error('HTTP ' + response.status)
        error.status = response.status
        throw error
    }
    return response.json()
}

async function getUser(username) {
    const url = APIURL + encodeURIComponent(username)

    try {
        createUserCard(await getJSON(url))
        addReposToCard(await getJSON(url + '/repos?sort=created'))
    } catch (err) {
        createErrorCard(err.status === 404 ? 'No profile with this username' : 'Problem Oluştu. Tekrar Deneyiniz')
    }
}

function createUserCard(user) {
    const name = user.name || user.login

    const avatar = element('img', 'avatar')
    avatar.src = user.avatar_url
    avatar.alt = name

    const picture = element('div')
    picture.append(avatar)

    const stats = element('ul')
    const counts = [
        [user.followers, 'Takipçi'],
        [user.following, 'Takip Edilen'],
        [user.public_repos, 'Projeler']
    ]
    counts.forEach(([count, label]) => {
        const item = element('li', '', count + ' ')
        item.append(element('strong', '', label))
        stats.append(item)
    })

    const repos = element('div')
    repos.id = 'repos'

    const info = element('div', 'user-info')
    info.append(element('h2', '', name), element('p', '', user.bio), stats, repos)

    const card = element('div', 'card')
    card.append(picture, info)
    main.replaceChildren(card)
}

function createErrorCard(msg) {
    const card = element('div', 'card')
    card.append(element('h1', '', msg))
    main.replaceChildren(card)
}

function addReposToCard(repos) {
    const reposEl = document.getElementById('repos')

    repos
        .slice(0, 5)
        .forEach(repo => {
            const repoEl = element('a', 'repo', repo.name)
            repoEl.href = repo.html_url
            repoEl.target = '_blank'
            repoEl.rel = 'noopener noreferrer'

            reposEl.appendChild(repoEl)
        })
}

form.addEventListener('submit', (e) => {
    e.preventDefault()

    const user = search.value.trim()

    if (user) {
        getUser(user)

        search.value = ''
    }
})
