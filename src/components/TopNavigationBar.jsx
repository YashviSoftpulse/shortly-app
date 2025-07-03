import React from 'react';
import { Tabs } from '@shopify/polaris';
import { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';

const tabs_ = [
    "dashboard",
    "generatelink",
    "help",
];

const tabs = [
    {
        id: 'dashboard',
        content: 'Dashboard',
        accessibilityLabel: 'Dashboard',
        panelID: 'dashboard',
    },
    {
        id: 'generate-link',
        content: 'Generate Links',
        accessibilityLabel: 'Generate Link',
        panelID: 'Generate Links',
    },
    {
        id: 'help',
        content: 'Help',
        accessibilityLabel: 'Help',
        panelID: 'Help',
    }
];

export default function TopNavBar() {
    const location = useLocation();
    const [selected, setSelected] = useState(tabs_.indexOf(location.pathname.split("/").pop()));
    const navigate = useNavigate();

    const handleTabChange = useCallback((selectedTabIndex) => {
        setSelected(selectedTabIndex);
        const paths = ['/dashboard', '/listing', '/help'];
        navigate({ pathname: paths[selectedTabIndex], search: window.location.search });
    }, [navigate]);

    return <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange} />;
}
