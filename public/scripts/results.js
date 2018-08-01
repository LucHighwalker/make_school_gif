var test = function (gif) {
    console.log(gif);

    firestore.collection("users").doc("testuser").get().then((data) => {
        console.log(data);
    });
}