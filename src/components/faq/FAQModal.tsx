import React, { useState, useEffect } from 'react';
import {
    Modal,
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    IconButton,
    Fab,
    ThemeProvider,
    createTheme,
    CssBaseline,
    CircularProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import { Quiz } from "@mui/icons-material";
import {ExtendedFAQ, getAllFAQs} from "@/actions/db/faq.action";

// Créer un thème sombre
const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

const FAQModal: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [faqItems, setFaqItems] = useState<ExtendedFAQ[]>([]);
    const [loading, setLoading] = useState(true);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    useEffect(() => {
        const fetchFAQs = async () => {
            try {
                const faqs = await getAllFAQs();
                setFaqItems(faqs);
            } catch (error) {
                console.error('Erreur lors de la récupération des FAQs:', error);
            } finally {
                setLoading(false);
            }
        };

        if (open) {
            fetchFAQs();
        }
    }, [open]);

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Fab
                aria-label="faq"
                onClick={handleOpen}
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    left: 16,
                    bgcolor: 'transparent',
                    boxShadow: 'none',
                    '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.08)',
                    },
                }}
            >
                <Quiz sx={{ color: 'white' }} />
            </Fab>

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="faq-modal-title"
                aria-describedby="faq-modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '80%',
                    maxWidth: 600,
                    maxHeight: '80vh',
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    overflow: 'auto',
                    borderRadius: 2,
                }}>
                    <Typography id="faq-modal-title" variant="h5" component="h2" gutterBottom align="center" fontWeight="bold">
                        FOIRE AUX QUESTIONS
                    </Typography>
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        faqItems.map((item, index) => (
                            <Accordion key={item.id}>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls={`panel${index}a-content`}
                                    id={`panel${index}a-header`}
                                >
                                    <Typography fontWeight="medium">{item.question}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography>{item.answer}</Typography>
                                </AccordionDetails>
                            </Accordion>
                        ))
                    )}
                </Box>
            </Modal>
        </ThemeProvider>
    );
};

export default FAQModal;