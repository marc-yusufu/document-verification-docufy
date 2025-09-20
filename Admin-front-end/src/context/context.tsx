import React, { createContext, useContext, useState, ReactNode } from "react";

type CommentContextType = {
  commentText: string;
  setCommentText: (text: string) => void;
};

const rejectedContext = createContext<CommentContextType | undefined>(undefined);

export const RejectedCommentProvider = ({ children }: { children: ReactNode }) => {
  const [commentText, setCommentText] = useState("");

  return (
    <rejectedContext.Provider value={{ commentText, setCommentText }}>
      {children}
    </rejectedContext.Provider>
  );
};

export const useComment = () => {
  const context = useContext(rejectedContext);
  if (!context) throw new Error("useComment must be used inside StampProvider");
  return context;
};
