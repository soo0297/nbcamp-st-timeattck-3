import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";

const App = () => {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [views, setViews] = useState(0);
  const [commentTexts, setCommentTexts] = useState({});
  const [selectedPostId, setSelectedPostId] = useState(null);

  // (4) useQuery 훅을 사용하여 posts 데이터 가져오기
  const {
    data: posts,
    isPending: isPostsPending,
    isError: isPostsError,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:4000/posts");
      return res.data;
    },
  });

  // (5) useQuery 훅을 사용하여 profile 데이터 가져오기
  const {
    data: profile,
    isPending: isProfilePending,
    isError: isProfileError,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:4000/profile");
      return res.data;
    },
  });

  // (6) useQuery 훅을 사용하여 comments 데이터 가져오기
  const { data: comments, isError: isCommentsError } = useQuery({
    queryKey: ["comments", selectedPostId],
    queryFn: async () => {
      const res = await axios.get(
        `http://localhost:4000/comments?postId=${selectedPostId}`
      );
      return res.data;
    },
    // !! 붙이는 이유: 불리언 값으로 변환하기 위함.
    enabled: !!selectedPostId,
  });

  // (7) useMutation 훅을 사용하여 addPost 함수 정의
  const { mutate: addPost } = useMutation({
    mutationFn: async (post) => {
      const res = await axios.post("http://localhost:4000/posts", post);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  // (8) useMutation 훅을 사용하여 addComment 함수 정의
  const { mutate: addComment } = useMutation({
    mutationFn: async (comment) => {
      const res = await axios.post("http://localhost:4000/comments", comment);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });

  // (9) 데이터 로딩 중일 때 로딩 메시지 표시
  if (isPostsPending || isProfilePending) {
    return <div>Loading...</div>;
  }
  // (10) 데이터 로딩 에러 발생 시 에러 메시지 표시
  if (isPostsError || isProfileError || isCommentsError) {
    return <div>Error</div>;
  }

  // (11) UI 렌더링
  return (
    <>
      <p>
        안녕하세요 <strong>{profile.name}</strong>님!
      </p>
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
            addPost({ title, views });
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
              <hr />
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addComment({
                    text: commentTexts[post.id] || "",
                    postId: post.id,
                  });
                  setCommentTexts((prev) => ({ ...prev, [post.id]: "" }));
                }}
              >
                <p>댓글 입력</p>
                <input
                  type="text"
                  placeholder="댓글"
                  value={commentTexts[post.id] || ""}
                  onChange={(e) =>
                    setCommentTexts((prev) => ({
                      ...prev,
                      [post.id]: e.target.value,
                    }))
                  }
                />
                <button type="submit">댓글추가</button>
              </form>
              <button
                onClick={() => {
                  setSelectedPostId(post.id);
                }}
              >
                댓글보기
              </button>
              {selectedPostId === post.id && (
                <div>
                  {comments?.map((comment) => {
                    return <p key={comment.id}>{comment.text}</p>;
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default App;
