import {
    BlockStack,
    Page,
    Tabs,
    InlineStack,
    Button,
} from '@shopify/polaris';

import { Overview, Links, Payouts, Create } from '../../../components';
import { useCallback, useEffect, useRef, useState } from 'react';
import { DateRangePicker } from '../../../components';

function InfluencerDashboard() {

    const [selected, setSelected] = useState(0);
    const [showCreatePayoutModal, setShowCreatePayoutModal] = useState(false);

    const payoutsRef = useRef();

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
            case 1: return (<Links selectedDates={selectedDates} />);
            case 2: return (<Payouts ref={payoutsRef} />);
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
                        {selected === 2 && (
                            <Button variant="primary" onClick={() => setShowCreatePayoutModal(true)}>
                                Create Payout
                            </Button>
                        )}
                    </InlineStack>

                </div>
                {renderTabContent()}
                {showCreatePayoutModal && (
                    <Create
                        onClose={() => setShowCreatePayoutModal(false)}
                        onSuccess={() => payoutsRef.current?.refreshData?.()} 
                    />
                )}


            </BlockStack>
        </Page>
    );
}

export default InfluencerDashboard;

