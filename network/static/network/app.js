document.addEventListener('DOMContentLoaded', function() {
    //Load all posts when clicking #allposts button
    document.querySelector('#allposts').addEventListener('click', allpostsView);
    document.querySelector('#following').addEventListener('click', followingView);

    //Load all posts by default
    allpostsView ();
    
    
    // Send new post to server when #post-form button is clicked
    document.querySelector('#post-form').onsubmit = () => {
        fetch('/posts', {
          method: 'POST',
          body: JSON.stringify({
             body: document.querySelector('#post-body').value
          })
        })
        .then(response => response.json())
        .then(result => {
          console.log(result);
        });

        document.querySelector('#post-body').value = '';
  
        setTimeout(() => allpostsView(),
                500);
        
        return false;
    }


  
});

//Load all posts
function allpostsView () {
  document.querySelector('#allposts-view ul').innerHTML = '';
  document.querySelector('#allposts-view').style.display = "block";
  document.querySelector('#create-view').style.display = "block";
  document.querySelector('#profile-view').style.display = "none";
  document.querySelector('#following-view').style.display = "none";

  let page=0;
  let postsPerPage = 10;
  

  fetch('/posts')
  .then(response => response.json())
  .then(posts => {
    console.log(posts);
    
    //Load first page
    for(let i = 0; i < page + postsPerPage; i++){
      createEntry(posts[i]);
    }

    //Load next page when #next-button is clicked
    document.querySelector("#allposts-view #next-button").addEventListener('click', () => {
      if (page >= posts.length - postsPerPage){
        page = 0;
      }else{
        page += postsPerPage;
      };
      document.querySelector("#allposts-view ul").innerHTML = '';
      for (let i = page; i < page + postsPerPage; i++){
        if(posts[i] !== undefined){
          createEntry(posts[i]);
        }
      }
    });
    //Load previous page when previous bottom is clicked
    document.querySelector("#allposts-view #previous-button").addEventListener('click', () => {
      if (page == 0){
        page = posts.length - postsPerPage;
      }else{
        page -= postsPerPage;
      };
      document.querySelector("#allposts-view ul").innerHTML = '';
      for (let i = page; i < page + postsPerPage; i++){
        if(posts[i] !== undefined){
          createEntry(posts[i]);
        }
      }
    });
  });


}

function createEntry(post){
  const entry = document.createElement('li');
      entry.className = 'entry list-group-item';
      entry.id = `id${post.id}`;
                                                //Load profile view when a username is clicked
      entry.innerHTML += `<h6><a class="profile" onclick="profileView(${post.userId},'${post.user}')">${post.user}</a></h6>
                          <p>${post.body}</p>
                          <p>${post.timestamp}</p>`;
      editPost(post,entry);
      entry.innerHTML += '<button class="btn likeButton"></button>  ';
      likePost(post,entry);
      document.querySelector("#allposts-view ul").append(entry);
}

//Load Profile
function profileView (usr,username) {
  document.querySelector('#profile-view ul').innerHTML = '';
  document.querySelector('#user-header').innerHTML = '';
  document.querySelector('#allposts-view').style.display = "none";
  document.querySelector('#create-view').style.display = "none";
  document.querySelector('#following-view').style.display = "none";
  document.querySelector('#profile-view').style.display = "block";

  //create elements inside user-header
  document.querySelector('#user-header').append(document.createElement('h3'));
  document.querySelector('#user-header').append(document.createElement('img'));
  document.querySelector('#user-header img').src = "https://ynassets.younow.com/user/live/49263235/49263235.jpg";
  document.querySelector('#user-header img').className = 'img-thumbnail';
  document.querySelector('#user-header').append(document.createElement('p'));
  document.querySelector('#user-header').append(document.createElement('p'));

  document.querySelector('#user-header h3').innerHTML = username;
  document.querySelector('#profile-view h4').innerHTML = `${username}'s posts:`;
  
  fetch('/followers')
  .then(response => response.json())
  .then(followers => {
    let i = 0;
    let k = 0;
    followers.forEach(follower => {
      if (follower.userId == usr){
        i++;
      }
      if (follower.followerId == usr){
        k++;
      }
    });
    document.querySelectorAll('#user-header p')[0].innerHTML = `Followers: ${i}`;
    document.querySelectorAll('#user-header p')[1].innerHTML = `Following: ${k}`;

    fetch('/current_user')
    .then(response => response.json())
    .then(current_user => {
      console.log(current_user.id);
      if(usr != current_user.id){
        let j = 0;
        followers.forEach(follower => {
          if (follower.userId == usr && follower.followerId == current_user.id){
            j++;
          }
        });
        button = document.createElement('btn');
        button.className = 'btn';
        if(j>0){
          button.className += ' btn-danger';
          button.innerHTML = 'Unfollow';
        }else{
          button.className += ' btn-success';
          button.innerHTML = 'Follow';
        }
        document.querySelector('#user-header').append(button);

        document.querySelector('#user-header btn').addEventListener('click', () => {
          fetch('/followers', {
            method: 'POST',
            body: JSON.stringify({
              profileUserId: usr,
              j: j
            })
          })
          .then(response => response.json())
          .then(result => {
            console.log(result);
          });
          setTimeout(() => profileView(usr,username),
                500);
        });
      }

    });



  });

  fetch('/posts')
  .then(response => response.json())
  .then(posts => {
    let userPosts = [];
    posts.forEach(post => {
      if(post.userId == usr){
        userPosts.push(post);
      }
    });
    userPosts.forEach(post => {
      createPost(post, '#profile-view');
    });
  });

}

//Load Following view
function followingView(){
  document.querySelector('#following-view').style.display = "block";
  document.querySelector('#allposts-view').style.display = "none";
  document.querySelector('#create-view').style.display = "none";
  document.querySelector('#profile-view').style.display = "none";

  fetch('/followers')
  .then(response => response.json())
  .then(followers => {
    fetch('/current_user')
    .then(response => response.json())
    .then(current_user => {
      // followedUsers = [];
      followers.forEach(follower => {
        if (follower.followerId == current_user.id){
          fetch('/posts')
          .then(response => response.json())
          .then(posts => {
            posts.forEach(post => {
              if(post.userId == follower.userId){
                createPost(post, '#following-view');
              }
            });
          });
          // followedUsers.push(follower.userId);
        }
      });
      // console.log(followedUsers);

    });
  });
}

function createPost(post, view){
  const entry = document.createElement('li');
  entry.className = 'list-group-item';
  entry.innerHTML = ` <h6><a class="profile">${post.user}</a></h6>
                      <p>${post.body}</p>
                      <p>${post.timestamp}</p>`;
  document.querySelector(`${view} ul`).append(entry);
}

function editPost(post, entry){
  fetch('/current_user')
  .then(response => response.json())
  .then(current_user => {
    if(current_user.id == post.userId){
      entry.innerHTML += '<button class="btn btn-primary editButton">Edit</button>';
      
      //Change post to edit form when edit button is clicked
      document.querySelector(`#allposts-view #id${post.id} .editButton`).addEventListener('click', () => {
        entry.innerHTML = ` <h6><a class="profile" onclick="profileView(${post.userId},'${post.user}')">${post.user}</a></h6>
                            <textarea id="edited-body">${post.body}</textarea>
                            <p>${post.timestamp}</p>
                            <button class="btn btn-primary saveButton">Save</button>`;

        //Send a PUT request with the new body value when save button is clicked
        document.querySelector(`#allposts-view #id${post.id} .saveButton`).addEventListener('click', () => {
          const newBody = document.querySelector(`#allposts-view #id${post.id} #edited-body`).value;
          fetch(`/posts/${post.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                body: newBody
            })
          })
          setTimeout(() => allpostsView(),
                500)
        });
      });
    }
  });
}

function likePost(post,entry){
  fetch('/current_user')
  .then(response => response.json())
  .then(current_user => {
    fetch('/likes')
    .then(response => response.json())
    .then(likes => {
      const likeButton = document.querySelector(`#allposts-view #id${post.id} .likeButton`);
      let i = 0;
      let k = 0;

      likes.forEach(like => {
        if (like.userId == current_user.id && like.postId == post.id){
          i++;
        }
        if (like.postId == post.id){
          k++;
        }
      });

      if(i > 0){
        likeButton.classList.remove("btn-success");
        likeButton.classList.add("btn-danger");
        likeButton.innerHTML = 'Unlike 	<i class="far fa-thumbs-down"></i>';
      }else{
        likeButton.classList.remove("btn-danger");
        likeButton.classList.add("btn-success");
        likeButton.innerHTML = 'Like <i class="far fa-thumbs-up"></i>';
      }


      const likesCounter = document.createElement('p');
      likesCounter.id = 'like-counter';
      likesCounter.innerHTML = `Likes: ${k}`;
      entry.append(likesCounter);
    

      likeButton.addEventListener('click', () => {
          console.log('eyyy');
          fetch('/likes', {
            method: 'POST',
            body: JSON.stringify({
              post_id: post.id,
              i: i
            })
          })
          .then(response => response.json())
          .then(result => {
            console.log(result);
          });
          setTimeout(() => allpostsView(),
              1000);
        });
    });
  });
}

