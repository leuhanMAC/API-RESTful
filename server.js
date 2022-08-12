const express = require('express');
const { Router } = express;
const Container = require('./contenedor');
const productFiles = new Container('productos.json');

const app = express();
const router = Router();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/api/productos', router);

const postMiddleware = (req, res, next) => {
    const { title, price, thumbnail } = req.body;

    if (!title || !price || !thumbnail) {
         res.status(400).json({
            error: 'Faltan datos'
        });
        res.end();
        return;
    }
    next();
};

const urlMiddleware = (req, res, next) => {
    const patternURL = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|jpeg|webp)/;
    const { thumbnail } = req.body;
    if (!thumbnail) {
        next();
    } else if (!patternURL.test(thumbnail)) {
        res.status(400).json({
            error: 'La URL no está en un formato válido (Debe empezar con el protocolo HTTP y terminar en jpg/gif/png/jpeg/webp)'
        });
        res.end();
        return;
    }

    next();
    
}

const priceMiddleware = (req, res, next) => {
    const patternPrice = /^(?=.*[1-9])[0-9]*[.]?[0-9]{1,2}$/;
    req.body.price = Number(req.body.price);
    if (!req.body.price) {
        next();
    } else if (!patternPrice.test(req.body.price)) {
        res.status(400).json({
            error: 'El precio no está en un formato válido (Debe ser un número con máximo dos decimales)'
        });
        res.end();
        return;
    }
    next();
}

const putMiddleware = (req, res, next) => {
    const { title, price, thumbnail } = req.body;

    if (!title && !price && !thumbnail) {
        res.status(400).json({
            error: 'Faltan datos'
        }).end();
        return;
    }
    next();
}

router.get('/', async (req, res) => {
    const productos = await productFiles.getAll();
    res.json(productos);
});

router.get('/:id', async (req, res) => {
    const producto = await productFiles.getById(req.params.id);

    producto 
    ? res.json(producto) 
    : res.status(404).json({
        error: 'Producto no encontrado'
    });
});

router.post('/', postMiddleware, urlMiddleware, priceMiddleware, async (req, res) => {
    const { title, price, thumbnail } = req.body;

    const producto = {
        title,
        price: Number(price),
        thumbnail
    };

    await productFiles.save(producto);
    res.json({
        mensaje: 'Producto creado',
        producto
    });
    res.end();
});

router.put('/:id', putMiddleware, urlMiddleware, priceMiddleware, async (req, res) => {
    const { title, price, thumbnail } = req.body;
    const { id } = req.params;
    const producto = { id : Number(id) };

    if (title) producto.title = title;
    if (price) producto.price = Number(price);
    if (thumbnail) producto.thumbnail = thumbnail;

    const productoRes = await productFiles.updateById(producto);

    productoRes 
    ? res.json({
        mensaje: 'Producto editado', 
        producto: productoRes
    })
    : res.status(404).json({
        error: 'Producto no encontrado'
    });

    res.end();
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    const producto = await productFiles.deleteById(Number(id));

    producto 
    ? res.json({
        mensaje: 'Producto eliminado',
        producto
    })
    : res.status(404).json({
        error: 'Producto no encontrado'
    });

    res.end();
});

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});