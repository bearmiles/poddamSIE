import React from 'react';
import { useState, useEffect } from 'react';
import styles from './styles.module.css';

const Messages = ({ socket }) => {
    const [messageReceived, setMessageReceived] = useState([]);

    useEffect(()=>{
        socket.on("receive_message", (data) => {
            console.log(data)
            setMessageReceived((state) => [
                ...state,
                {
                    message: data.message,
                    username: data.username,
                    __createdtime__: data.__createdtime__,
                },
            ]);
        });

        return () => socket.off('receive_message');
    }, [socket]);

    function formatDateFormTimestamp(timestamp){
        const date = new Date(timestamp);
        return date.toLocaleString();
    }
  return (
    <div className={styles.messagesColumn}>
      {messageReceived.map((msg, i) => (
        <div className={styles.message} key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className={styles.msgMeta}>{msg.username}</span>
            <span className={styles.msgMeta}>
              {formatDateFormTimestamp(msg.__createdtime__)}
            </span>
          </div>
          <p className={styles.msgText}>{msg.message}</p>
          <br />
        </div>
      ))}
    </div>
  );
};

export default Messages
