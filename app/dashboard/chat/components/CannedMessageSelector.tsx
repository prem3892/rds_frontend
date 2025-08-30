"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Search, Tag } from "lucide-react";
import { useGetCannedMessages } from "@/lib/canned.api";
import { CannedMessage } from "@/types";
import { cn } from "@/lib/utils";
import debounce from "lodash/debounce";

interface CannedMessageSelectorProps {
  isVisible: boolean;
  searchQuery: string;
  onSelectMessage: (content: string) => void;
  onClose: () => void;
}

const CannedMessageSelector = ({
  isVisible,
  searchQuery,
  onSelectMessage,
  onClose,
}: CannedMessageSelectorProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Debounced search query for API calls
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Debounce the search query
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.replace(/^#/, ""));
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch canned messages with debounced search filter
  const { data: cannedMessagesResponse, isLoading } = useGetCannedMessages({
    search: debouncedSearchQuery,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const messages = cannedMessagesResponse?.items || [];

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Scroll to selected item when it changes
  useEffect(() => {
    if (isVisible && messages.length > 0) {
      setTimeout(() => {
        const selectedElement = scrollContainerRef.current?.querySelector(`[data-message-index="${selectedIndex}"]`);
        if (selectedElement) {
          selectedElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
          });
        }
      }, 100);
    }
  }, [selectedIndex, isVisible, messages.length]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => {
            const newIndex = prev < messages.length - 1 ? prev + 1 : 0;
            // Scroll to the selected item
            setTimeout(() => {
              const selectedElement = scrollContainerRef.current?.querySelector(`[data-message-index="${newIndex}"]`);
              if (selectedElement) {
                selectedElement.scrollIntoView({
                  behavior: 'smooth',
                  block: 'nearest'
                });
              }
            }, 0);
            return newIndex;
          });
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => {
            const newIndex = prev > 0 ? prev - 1 : messages.length - 1;
            // Scroll to the selected item
            setTimeout(() => {
              const selectedElement = scrollContainerRef.current?.querySelector(`[data-message-index="${newIndex}"]`);
              if (selectedElement) {
                selectedElement.scrollIntoView({
                  behavior: 'smooth',
                  block: 'nearest'
                });
              }
            }, 0);
            return newIndex;
          });
          break;
        case "Enter":
          e.preventDefault();
          if (messages[selectedIndex]) {
            onSelectMessage(messages[selectedIndex].content);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, messages, selectedIndex, onSelectMessage, onClose]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 z-50">
      <Card 
        ref={containerRef}
        className="w-[70%] mx-auto shadow-lg border border-gray-200 bg-white p-0 "
      >
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50 rounded-t-lg">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">
                Canned Messages
              </span>
              {searchQuery && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  Search: {searchQuery.replace(/^#/, "")}
                  {isSearching && (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                  )}
                </span>
              )}
            </div>
            <Badge variant="secondary" className="text-xs">
              {messages.length} messages
            </Badge>
          </div>

          {/* Messages List */}
          <div ref={scrollContainerRef} className="max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mx-auto mb-2"></div>
                Loading messages...
              </div>
            ) : messages.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchQuery ? "No messages found" : "No canned messages available"}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {messages.map((message, index) => (
                  <div
                    key={message._id}
                    data-message-index={index}
                    className={cn(
                      "p-3 cursor-pointer transition-colors hover:bg-blue-50",
                      selectedIndex === index && "bg-blue-100 border-l-4 border-blue-500"
                    )}
                    onClick={() => onSelectMessage(message.content)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {message.title}
                          </h4>
                          {message.isGlobal && (
                            <Badge variant="outline" className="text-xs">
                              Global
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {message.content}
                        </p>
                        {message.tags.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            <Tag className="h-3 w-3 text-gray-400" />
                            <div className="flex gap-1">
                              {message.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {message.tags.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{message.tags.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-gray-100 bg-gray-50 rounded-b-lg">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span>↑↓ Navigate</span>
                <span>Enter Select</span>
                <span>Esc Close</span>
              </div>
              <span>Press # to search</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CannedMessageSelector;
