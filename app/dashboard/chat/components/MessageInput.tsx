import React, { useRef, useState, useCallback, useEffect } from "react";
import debounce from "lodash/debounce";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import CannedMessageSelector from "./CannedMessageSelector";

interface MessageInputProps {
  disabled: boolean;
  onSendMessage: (message: string) => void;
  onTypingStart: (sessionId: string) => void;
  onTypingStop: (sessionId: string) => void;
  sessionId: string | null;
}

const MessageInput = ({
  disabled,
  onSendMessage,
  onTypingStart,
  onTypingStop,
  sessionId,
}: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showCannedMessages, setShowCannedMessages] = useState(false);
  const [cannedMessageQuery, setCannedMessageQuery] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Create debounced version of the typing stop function
  const debouncedTypingStop = useCallback(
    debounce((sessionId: string) => {
      if (isTyping) {
        setIsTyping(false);
        onTypingStop(sessionId);
      }
    }, 1500), // Wait 1.5 seconds of inactivity before stopping the typing indicator
    [isTyping, onTypingStop]
  );

  // Create a memoized version of the typing start function
  const handleTypingStart = useCallback(
    (sessionId: string) => {
      if (!isTyping) {
        setIsTyping(true);
        onTypingStart(sessionId);
      }
    },
    [isTyping, onTypingStart]
  );

  const handleSend = () => {
    if (message.trim() && sessionId) {
      onSendMessage(message.trim());
      setMessage("");
      setShowCannedMessages(false);
      setCannedMessageQuery("");

      // Cancel debounced typing stop and immediately stop typing indicator
      if (isTyping) {
        debouncedTypingStop.cancel();
        setIsTyping(false);
        onTypingStop(sessionId);
      }

      // Keep focus on the input
      textareaRef.current?.focus();
    }
  };

  const handleCannedMessageSelect = (content: string) => {
    const currentMessage = message;
    const hashIndex = currentMessage.lastIndexOf("#");
    
    let newMessage: string;
    let cursorPosition: number;
    
    if (hashIndex !== -1) {
      // Replace the # trigger text with the canned message content
      const beforeHash = currentMessage.slice(0, hashIndex);
      newMessage = beforeHash + content;
      cursorPosition = newMessage.length;
    } else {
      // If no # found, just append the content
      newMessage = currentMessage + (currentMessage ? " " : "") + content;
      cursorPosition = newMessage.length;
    }
    
    setMessage(newMessage);
    setShowCannedMessages(false);
    setCannedMessageQuery("");
    
    // Set cursor position after the component re-renders
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 0);
  };

  const handleCannedMessageClose = () => {
    setShowCannedMessages(false);
    setCannedMessageQuery("");
    textareaRef.current?.focus();
  };

  // Cleanup effect for debounced functions
  useEffect(() => {
    return () => {
      // Cancel any pending debounced calls on unmount
      debouncedTypingStop.cancel();

      // If still typing, send typing stop signal
      if (isTyping && sessionId) {
        onTypingStop(sessionId);
      }
    };
  }, [debouncedTypingStop, isTyping, sessionId, onTypingStop]);

  return (
    <footer className="p-3 sm:p-4 rounded-b-3xl bg-white relative">
      {/* Canned Message Selector */}
      <CannedMessageSelector
        isVisible={showCannedMessages}
        searchQuery={cannedMessageQuery}
        onSelectMessage={handleCannedMessageSelect}
        onClose={handleCannedMessageClose}
      />
      
      <div className="flex items-center space-x-2">
        <Textarea
          ref={textareaRef}
          placeholder="Type your message... (Press # for canned messages)"
          value={message}
          onChange={(e) => {
            const newValue = e.target.value;
            setMessage(newValue);

            // Handle canned message trigger
            if (newValue.includes("#")) {
              const hashIndex = newValue.lastIndexOf("#");
              const afterHash = newValue.slice(hashIndex);
              
              if (afterHash === "#") {
                // Just # pressed, show all messages
                setShowCannedMessages(true);
                setCannedMessageQuery("#");
              } else if (afterHash.startsWith("#") && afterHash.length > 1) {
                // # followed by text, search with that text
                setShowCannedMessages(true);
                setCannedMessageQuery(afterHash);
              } else {
                // No # in current position, hide selector
                setShowCannedMessages(false);
                setCannedMessageQuery("");
              }
            } else {
              // No # in message, hide selector
              setShowCannedMessages(false);
              setCannedMessageQuery("");
            }

            // Handle typing indicators with debounce
            if (sessionId) {
              if (newValue.length > 0) {
                // Start typing and schedule the stop
                handleTypingStart(sessionId);
                debouncedTypingStop(sessionId);
              } else {
                // If cleared, immediately stop typing
                debouncedTypingStop.cancel();
                if (isTyping) {
                  setIsTyping(false);
                  onTypingStop(sessionId);
                }
              }
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
            // Close canned message selector on Escape
            if (e.key === "Escape" && showCannedMessages) {
              e.preventDefault();
              handleCannedMessageClose();
            }
          }}
          rows={1}
          className="flex-1 resize-none min-h-[40px] max-h-[120px] text-sm bg-gray-50 border-gray-200"
          disabled={disabled}
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          size="icon"
          className="h-9 w-9 flex-shrink-0"
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </footer>
  );
};

export default MessageInput;
