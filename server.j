const express = require('express');
const path = require('path');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

const MP_ACCESS_TOKEN = 'APP_USR-8797267091485744-080614-3628865a23abc1d781f9b5ba94633ab4-3361822415';

app.use(express.json());
app.use(express.static(__dirname));

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// Proxy - Criar PIX
app.post('/api/pix', async (req, res) => {
    console.log('📥 Recebendo requisição PIX...');
    console.log('Body:', JSON.stringify(req.body));
    
    try {
        const response = await axios.post('https://api.mercadopago.com/v1/payments', req.body, {
            headers: {
                'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
                'X-Idempotency-Key': `pix_${Date.now()}`
            },
            timeout: 15000
        });
        
        console.log('✅ PIX criado:', response.data.id);
        res.json(response.data);
        
    } catch (error) {
        console.error('❌ Erro:', error.response?.data || error.message);
        
        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }
        
        res.status(500).json({ 
            message: error.message,
            error: true 
        });
    }
});

// Proxy - Verificar PIX
app.get('/api/pix/:id', async (req, res) => {
    try {
        const response = await axios.get(`https://api.mercadopago.com/v1/payments/${req.params.id}`, {
            headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` },
            timeout: 10000
        });
        
        res.json(response.data);
        
    } catch (error) {
        console.error('❌ Erro verificação:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
    }
});

// Servir index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`💳 Mercado Pago Proxy ativo`);
});
