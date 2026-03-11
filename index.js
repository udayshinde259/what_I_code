let post = document.getElementById("posts");

async function getPosts() {
    let response = await fetch("https://jsonplaceholder.typicode.com/todos/1")
    let data = await response.json();

    post.innerHTML = data.title;
}

getPosts();