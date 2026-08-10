const express = require('express');
const path = require('path');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

const MP_ACCESS_TOKEN = 'APP_USR-8797267091485744-080614-3628865a23abc1d781f9b5ba94633ab4-3361822415';
const MP_API = 'https://api.mercadopago.com/v1/payments';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static(__dirname));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

app.post('/api/pix', async (req, res) => {
    try {
        console.log('📥 Criando PIX:', req.body.transaction_amount, req.body.description);
        
        const response = await axios.post(MP_API, req.body, {
            headers: {
                'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
                'X-Idempotency-Key': `pix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            },
            timeout: 15000
        });
        
        console.log('✅ PIX criado com sucesso!');
        console.log('🔑 ID:', response.data.id);
        console.log('📊 Status:', response.data.status);
        
        return res.json(response.data);
        
    } catch (error) {
        console.error('❌ Erro ao criar PIX:', error.response?.data || error.message);
        
        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }
        
        return res.status(500).json({ 
            message: error.message || 'Erro interno do servidor',
            error: true
        });
    }
});

app.get('/api/pix/:id', async (req, res) => {
    try {
        const response = await axios.get(`${MP_API}/${req.params.id}`, {
            headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` },
            timeout: 10000
        });
        
        return res.json(response.data);
        
    } catch (error) {
        console.error('❌ Erro ao verificar:', error.response?.data || error.message);
        
        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }
        
        return res.status(500).json({ 
            message: error.message || 'Erro ao verificar pagamento',
            error: true
        });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'online', gateway: 'Mercado Pago', timestamp: new Date().toISOString() });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log('🚀 ==========================================');
    console.log('🚀 COLAB HOT PRO - Servidor Iniciado');
    console.log('🚀 ==========================================');
    console.log(`📍 Porta: ${PORT}`);
    console.log(`💳 Gateway: Mercado Pago`);
    console.log(`🔗 API PIX: POST /api/pix`);
    console.log(`🔍 Verificar: GET /api/pix/:id`);
    console.log('🚀 ==========================================');
});
