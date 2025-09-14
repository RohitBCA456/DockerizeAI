import React, { useState } from 'react';
import { File, Folder, ChevronDown, ChevronRight } from 'lucide-react';
import Card from './ui/Card'; // Assuming Card is in the ui subfolder

const FileTree = ({ title, files, onFileSelect }) => {
  const [expandedFolders, setExpandedFolders] = useState({});

  const toggleFolder = (folderPath) => {
    setExpandedFolders(prev => ({ ...prev, [folderPath]: !prev[folderPath] }));
  };

  const renderTree = (tree, path = '') => {
    // Guard against null or undefined tree data
    if (!tree) return null;

    return Object.entries(tree).map(([name, content]) => {
      const currentPath = path ? `${path}/${name}` : name;
      
      // 🔹 THE FIX: A more robust check for what a "folder" is.
      // This now correctly handles cases where content might be null.
      const isFolder = content && typeof content === 'object';

      if (isFolder) {
        const isExpanded = expandedFolders[currentPath];
        return (
          <div key={currentPath}>
            <div
              className="flex items-center cursor-pointer p-1 rounded hover:bg-gray-700"
              onClick={() => toggleFolder(currentPath)}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4 mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
              <Folder className="w-4 h-4 mr-2 text-yellow-400" />
              <span>{name}</span>
            </div>
            {isExpanded && <div className="pl-6 border-l border-gray-600 ml-2">{renderTree(content, currentPath)}</div>}
          </div>
        );
      } else {
        return (
          <div
            key={currentPath}
            className="flex items-center cursor-pointer p-1 rounded hover:bg-gray-700"
            onClick={() => onFileSelect({ path: currentPath, content: content || '' })} // Ensure content is not null
          >
            <File className="w-4 h-4 mr-2 text-blue-400 ml-2" />
            <span>{name}</span>
          </div>
        );
      }
    });
  };

  const buildTree = (fileMap) => {
    const tree = {};
    if (!fileMap) return tree;

    Object.keys(fileMap).forEach(path => {
      let currentLevel = tree;
      const parts = path.split('/');
      parts.forEach((part, index) => {
        if (!part) return; // Skip empty parts from leading/trailing slashes
        if (index === parts.length - 1) {
          currentLevel[part] = fileMap[path];
        } else {
          currentLevel[part] = currentLevel[part] || {};
          currentLevel = currentLevel[part];
        }
      });
    });
    return tree;
  };
  
  const fileTree = buildTree(files);

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-2 text-gray-200">{title}</h3>
      <div className="text-sm font-mono text-gray-300">{renderTree(fileTree)}</div>
    </Card>
  );
};

export default FileTree;