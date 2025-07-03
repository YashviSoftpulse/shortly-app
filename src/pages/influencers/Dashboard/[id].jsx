import {
    BlockStack,
    Page,
    Tabs,
    InlineStack,
} from '@shopify/polaris';

import { Overview, Links, Payouts } from '../../../components';
import { useCallback, useEffect, useState } from 'react';
import { DateRangePicker } from '../../../components';

function InfluencerDashboard() {

    const [selected, setSelected] = useState(0);

    function getESTDate(offsetDays = 0) {
        const now = new Date();
        const estTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
        estTime.setDate(estTime.getDate() + offsetDays);
        return estTime;
    }

    const today = getESTDate();
    const yesterday = getESTDate(-1);

    const [selectedDates, setSelectedDates] = useState({
        start: yesterday,
        end: today,
    });

    const handleDateRangeChange = (value) => {
        if (value && value.start && value.end) {
            setSelectedDates({
                start: new Date(value.start),
                end: new Date(value.end),
            });
        } else {
            console.error("Invalid date range selected");
        }
    };

    useEffect(() => {
        const tabIntent = sessionStorage.getItem('influencerTab');
        if (tabIntent === 'links') {
            setSelected(1);
            sessionStorage.removeItem('influencerTab');
        }
    }, []);

    const tabs = [
        { id: 'overview', content: 'Overview', panelID: 'overview-content' },
        { id: 'links', content: 'Links', panelID: 'links-content' },
        { id: 'payouts', content: 'Payouts', panelID: 'payouts-content' },
    ];

    const handleTabChange = useCallback((selectedTabIndex) => {
        setSelected(selectedTabIndex);
    }, []);

    const renderTabContent = () => {
        switch (selected) {
            case 0: return (<Overview selectedDates={selectedDates} />);
            case 1: return (<Links />);
            case 2: return (<Payouts />);
            default: return <Overview selectedDates={selectedDates} />;
        }
    };

    return (
        <Page
            title="Influencer Dashboard"
            backAction={{ content: 'Influencer', url: `/influencers${window.location.search}` }}
        >
            <BlockStack gap="400">
                <div className='influencerDashboardTabs'>
                    <InlineStack gap={400} align='space-between'>
                        <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange} />
                        {(selected === 0) && (
                            <DateRangePicker
                                onDateRangeSelect={handleDateRangeChange}
                                value={selectedDates}
                            />
                        )}
                    </InlineStack>

                </div>
                {renderTabContent()}
            </BlockStack>
        </Page>
    );
}

export default InfluencerDashboard;



