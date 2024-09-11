import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";

const App = () => {
  const queryClient = useQueryClient();

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

  const [title, setTitle] = useState("");
  const [views, setViews] = useState(0);

  const {
    data: posts,
    isPending,
    isError,
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

  if (isPending) {
    return <div>로딩중입니다...</div>;
  }
  if (isError) {
    return <div>에러가 발생했습니다.</div>;
  }

  return (
    <div>
      <div>
        <label>title</label>
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
          placeholder="title 입력"
        />
      </div>
      <div>
        <label>views</label>
        <input
          value={views}
          onChange={(e) => {
            setViews(e.target.value);
          }}
          placeholder="views 입력"
        />
      </div>
      <button
        onClick={() => {
          mutation.mutate({ title, views });
        }}
      >
        추가
      </button>
      {posts?.map((post) => {
        return (
          <div key={post.id}>
            <span>{post.title}</span>
            <span>{post.views}</span>
          </div>
        );
      })}
    </div>
  );
};

export default App;
