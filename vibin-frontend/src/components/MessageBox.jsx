const MessageBox = ({ text, sender }) => {
    return (
      <div className="mb-2 p-3 bg-gray-200 rounded-md">
        <div className="text-sm text-gray-500">{sender}</div>
        <div className="text-lg">{text}</div>
      </div>
    );
  };
  
  export default MessageBox;
  