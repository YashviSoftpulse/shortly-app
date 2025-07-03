import {
    Modal,
    TextField,
    Button,
    BlockStack,
    InlineStack,
    Text,
    FormLayout,
    Select
} from '@shopify/polaris';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

function CreatePayout({ onClose }) {
    const [amount, setAmount] = useState('');
    const [payoutDate, setPayoutDate] = useState('');
    const [payoutMethod, setPayoutMethod] = useState('');
    const [status, setStatus] = useState(1);
    const [processedBy, setProcessedBy] = useState('');

    const [note, setNote] = useState('');

    const handleCreate = () => {
        console.log('Creating payout with:', { amount, note });
        onClose();
    };

    const { id } = useParams();

    const savePayouts = async () => {
        const formData = new FormData();
        formData.append("uid", id);
        formData.append("amount", amount);
        formData.append("payoutDate", payoutDate);
        formData.append("payoutMethod", 1);
        formData.append("status", 1);
        formData.append("processedBy", 'Arpan');

        const response = await fetchData(getApiURL("/save-payout"), formData);

        if (response?.status === true) {
            console.log(response);
        } else {
            setInfluencers([]);
        }
    };

    useEffect(() => {
        savePayouts();
    }, []);

    return (
        <Modal
            open
            onClose={onClose}
            title="Create Payout"
            primaryAction={{
                content: 'Create',
                onAction: handleCreate,
            }}
            secondaryActions={[
                {
                    content: 'Cancel',
                    onAction: onClose,
                },
            ]}
        >
            <Modal.Section>
                <FormLayout>
                    <BlockStack gap="300">
                        <TextField
                            label="Amount"
                            type="text"
                            value={processedBy}
                            onChange={setProcessedBy}
                            autoComplete="off"
                        />

                        <FormLayout.Group>
                            <TextField
                                label="Amount"
                                type="number"
                                value={amount}
                                onChange={setAmount}
                                autoComplete="off"
                            />
                            <TextField
                                label="Note (optional)"
                                value={payoutDate}
                                onChange={setPayoutDate}
                                autoComplete="off"
                                multiline
                            />
                            <Select
                                options={payoutMethodOptions}
                                onChange={handlePayoutChange}
                                value={selectedPayoutMethod}
                            />
                        </FormLayout.Group>
                    </BlockStack>
                </FormLayout>

            </Modal.Section>
        </Modal>
    );
}

export default CreatePayout;
