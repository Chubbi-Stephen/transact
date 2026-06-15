import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
    const [activeModal, setActiveModal] = useState(null);
    const [modalData, setModalData] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const openModal = (type, data = null) => {
        setActiveModal(type);
        setModalData(data);
    };

    const closeModal = () => {
        setActiveModal(null);
        setModalData(null);
    };

    const toggleChat = (val) => {
        setIsChatOpen(val !== undefined ? val : !isChatOpen);
    };

    return (
        <UIContext.Provider value={{ 
            activeModal, 
            modalData, 
            openModal, 
            closeModal, 
            isChatOpen, 
            toggleChat 
        }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) throw new Error('useUI must be used within a UIProvider');
    return context;
};
