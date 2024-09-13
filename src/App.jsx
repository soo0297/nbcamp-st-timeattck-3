import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";

const App = () => {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [views, setViews] = useState(0);

  const getPosts = async () => {
    const response = await axios.get("http://localhost:4000/posts");
    return response.data;
  };

  const addPost = async (newPost) => {
    const response = await axios.post("http://localhost:4000/posts", {
      title: newPost.title,
      views: newPost.views,
    });
    return response.data;
  };

  const {
    data: posts,
    isPending: isPostsPending,
    isError: isPostsError,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: getPosts,
  });

  const mutation = useMutation({
    mutationFn: addPost,
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
    },
  });

  if (isPostsPending) {
    return <div>로딩중입니다...</div>;
  }
  if (isPostsError) {
    return <div>에러가 발생했습니다.</div>;
  }

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addPost({ title, views });
          setTitle("");
          setViews(0);
        }}
      >
        <input
          type="text"
          placeholder="제목"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
        />
        <input
          type="number"
          placeholder="views 입력"
          value={views}
          onChange={(e) => {
            setViews(e.target.value);
          }}
        />
        <button
          type="submit"
          onClick={() => {
            mutation.mutate({ title, views });
          }}
        >
          추가
        </button>
      </form>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          // justifyContent: "center",
        }}
      >
        {posts?.map((post) => {
          return (
            <div
              key={post.id}
              style={{
                backgroundColor: "#f0f0f0",
                border: "1px solid black",
                padding: "10px",
                borderRadius: "10px",
                margin: "10px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <h3>{post.title}</h3>
              <p>{post.views}</p>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default App;
