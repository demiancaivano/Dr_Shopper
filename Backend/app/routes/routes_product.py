from flask import Blueprint, request, jsonify
from app.models import Product, Category, Brand, Review, Discount, ReviewLike
from app import db # type: ignore
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func

product_bp = Blueprint('product_bp', __name__)

# ==================== RUTAS DE PRODUCTOS ====================

@product_bp.route('/', methods=['GET'])
def get_products():
    """Obtener todos los productos con filtros opcionales"""
    # Parámetros de paginación
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # Limitar per_page para evitar consultas muy pesadas
    if per_page > 100:
        per_page = 100
    elif per_page < 1:
        per_page = 10
    
    # Filtros básicos
    category_id = request.args.get('category_id', type=int)
    brand_ids = request.args.getlist('brand_id', type=int)
    search = request.args.get('search', '')
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    in_stock = request.args.get('in_stock', type=bool)
    
    # Filtros adicionales
    min_stock = request.args.get('min_stock', type=int)
    max_stock = request.args.get('max_stock', type=int)
    is_new = request.args.get('is_new', type=bool)  # Productos de los últimos 30 días
    has_image = request.args.get('has_image', type=bool)  # Productos con imagen
    has_discount = request.args.get('has_discount', type=bool)  # Productos con descuento
    min_rating = request.args.get('min_rating', type=float)  # Rating mínimo
    sort_by = request.args.get('sort_by', 'rating')  # rating, name, price, creation_date, stock, discount
    sort_order = request.args.get('sort_order', 'desc')  # asc, desc
    
    query = Product.query.filter(Product.is_active == True)
    
    # Aplicar filtros básicos
    if category_id:
        query = query.filter(Product.category_id == category_id)
    
    if brand_ids:
        if len(brand_ids) == 1:
            query = query.filter(Product.brand_id == brand_ids[0])
        else:
            query = query.filter(Product.brand_id.in_(brand_ids))
    
    if search:
        # Búsqueda en nombre, descripción, marca y categoría
        search_filter = f'%{search}%'
        query = query.filter(
            db.or_(
                Product.name.ilike(search_filter),
                Product.description.ilike(search_filter),
                Brand.name.ilike(search_filter),
                Category.name.ilike(search_filter)
            )
        ).join(Brand, Product.brand_id == Brand.id, isouter=True).join(Category, Product.category_id == Category.id, isouter=True)
    
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    
    if in_stock:
        query = query.filter(Product.stock > 0)
    
    # Aplicar filtros adicionales
    if min_stock is not None:
        query = query.filter(Product.stock >= min_stock)
    
    if max_stock is not None:
        query = query.filter(Product.stock <= max_stock)
    
    if is_new:
        # Productos de los últimos 30 días
        from datetime import datetime, timedelta
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        query = query.filter(Product.creation_date >= thirty_days_ago)
    
    if has_image:
        query = query.filter(Product.image_url.isnot(None)).filter(Product.image_url != '')
    
    if has_discount:
        query = query.filter(Product.discount_percentage > 0)
    
    if min_rating is not None:
        # Subconsulta para obtener productos con rating mínimo
        subquery = db.session.query(Review.product_id, func.avg(Review.rating).label('avg_rating')).group_by(Review.product_id).having(func.avg(Review.rating) >= min_rating).subquery()
        query = query.join(subquery, Product.id == subquery.c.product_id)
    
    # Aplicar ordenamiento
    if sort_by == 'price':
        if sort_order == 'desc':
            query = query.order_by(Product.price.desc())
        else:
            query = query.order_by(Product.price.asc())
    elif sort_by == 'creation_date':
        if sort_order == 'desc':
            query = query.order_by(Product.creation_date.desc())
        else:
            query = query.order_by(Product.creation_date.asc())
    elif sort_by == 'stock':
        if sort_order == 'desc':
            query = query.order_by(Product.stock.desc())
        else:
            query = query.order_by(Product.stock.asc())
    elif sort_by == 'rating':
        # Ordenar por rating promedio
        subquery = db.session.query(Review.product_id, func.avg(Review.rating).label('avg_rating')).group_by(Review.product_id).subquery()
        query = query.outerjoin(subquery, Product.id == subquery.c.product_id)
        if sort_order == 'desc':
            query = query.order_by(subquery.c.avg_rating.desc().nullslast())
        else:
            query = query.order_by(subquery.c.avg_rating.asc().nullslast())
    elif sort_by == 'discount':
        if sort_order == 'desc':
            query = query.order_by(Product.discount_percentage.desc())
        else:
            query = query.order_by(Product.discount_percentage.asc())
    else:  # name por defecto
        if sort_order == 'desc':
            query = query.order_by(Product.name.desc())
        else:
            query = query.order_by(Product.name.asc())
    
    # Aplicar paginación
    products = query.paginate(page=page, per_page=per_page, error_out=False)
    
    # Obtener ratings para cada producto
    product_list = []
    for product in products.items:
        product_data = product.serialize()
        
        # Calcular rating promedio y cantidad de reviews
        reviews_stats = db.session.query(
            func.avg(Review.rating).label('avg_rating'),
            func.count(Review.id).label('review_count')
        ).filter(Review.product_id == product.id).first()
        
        product_data['rating'] = {
            'average': float(reviews_stats.avg_rating or 0),
            'count': int(reviews_stats.review_count or 0)
        }
        
        product_list.append(product_data)
    
    return jsonify({
        'products': product_list,
        'total': products.total,
        'pages': products.pages,
        'current_page': page,
        'per_page': per_page,
        'has_next': products.has_next,
        'has_prev': products.has_prev,
        'filters_applied': {
            'category_id': category_id,
            'brand_id': brand_ids,
            'search': search,
            'min_price': min_price,
            'max_price': max_price,
            'in_stock': in_stock,
            'min_stock': min_stock,
            'max_stock': max_stock,
            'is_new': is_new,
            'has_image': has_image,
            'has_discount': has_discount,
            'min_rating': min_rating,
            'sort_by': sort_by,
            'sort_order': sort_order
        }
    }), 200

@product_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Obtener un producto específico por ID"""
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'message': 'Producto no encontrado'}), 404
    
    # Calcular estadísticas de rating
    rating_stats = db.session.query(
        func.avg(Review.rating).label('average'),
        func.count(Review.id).label('count')
    ).filter_by(product_id=product_id).first()
    
    # Serializar el producto y agregar las estadísticas de rating
    product_data = product.serialize()
    product_data['rating'] = {
        'average': float(rating_stats.average or 0),
        'count': int(rating_stats.count or 0)
    }
    
    return jsonify(product_data), 200

@product_bp.route('/', methods=['POST'])
@jwt_required()
def create_product():
    """Crear un nuevo producto (solo admin)"""
    current_user_id = get_jwt_identity()
    from app.models import User
    user = User.query.get(current_user_id)
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Acceso denegado. Se requieren permisos de administrador'}), 403
    
    data = request.get_json()
    required_fields = ['name', 'price', 'stock', 'category_id']
    
    if not all(field in data and data[field] is not None for field in required_fields):
        return jsonify({'message': 'Faltan campos requeridos'}), 400
    
    # Verificar que la categoría existe
    category = Category.query.get(data['category_id'])
    if not category:
        return jsonify({'message': 'Categoría no encontrada'}), 404
    
    # Verificar que la marca existe si se proporciona
    if data.get('brand_id'):
        brand = Brand.query.get(data['brand_id'])
        if not brand:
            return jsonify({'message': 'Marca no encontrada'}), 404
    
    try:
        new_product = Product()
        new_product.name = data['name']
        new_product.description = data.get('description', '')
        new_product.price = float(data['price'])
        new_product.stock = int(data['stock'])
        new_product.image_url = data.get('image_url', '')
        images = data.get('images')
        if images is not None:
            new_product.images = images
        new_product.category_id = data['category_id']
        new_product.brand_id = data.get('brand_id')
        new_product.discount_percentage = float(data.get('discount_percentage', 0.0))
        new_product.is_active = data.get('is_active', True)
        
        db.session.add(new_product)
        db.session.commit()
        
        return jsonify({
            'message': 'Producto creado exitosamente',
            'product': new_product.serialize()
        }), 201
        
    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Error al crear el producto'}), 400

@product_bp.route('/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    """Actualizar un producto existente (solo admin)"""
    current_user_id = get_jwt_identity()
    from app.models import User
    user = User.query.get(current_user_id)
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Acceso denegado. Se requieren permisos de administrador'}), 403
    
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'message': 'Producto no encontrado'}), 404
    
    data = request.get_json()
    
    try:
        if 'name' in data:
            product.name = data['name']
        if 'description' in data:
            product.description = data['description']
        if 'price' in data:
            product.price = float(data['price'])
        if 'stock' in data:
            product.stock = int(data['stock'])
        if 'image_url' in data:
            product.image_url = data['image_url']
        if 'images' in data:
            product.images = data['images']
        if 'category_id' in data:
            # Verificar que la categoría existe
            category = Category.query.get(data['category_id'])
            if not category:
                return jsonify({'message': 'Categoría no encontrada'}), 404
            product.category_id = data['category_id']
        if 'brand_id' in data:
            # Verificar que la marca existe si se proporciona
            if data['brand_id']:
                brand = Brand.query.get(data['brand_id'])
                if not brand:
                    return jsonify({'message': 'Marca no encontrada'}), 404
            product.brand_id = data['brand_id']
        if 'discount_percentage' in data:
            product.discount_percentage = float(data['discount_percentage'])
        if 'is_active' in data:
            product.is_active = data['is_active']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Producto actualizado exitosamente',
            'product': product.serialize()
        }), 200
        
    except ValueError as e:
        return jsonify({'message': str(e)}), 400

@product_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    """Eliminar un producto (solo admin)"""
    current_user_id = get_jwt_identity()
    from app.models import User
    user = User.query.get(current_user_id)
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Acceso denegado. Se requieren permisos de administrador'}), 403
    
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'message': 'Producto no encontrado'}), 404
    
    try:
        db.session.delete(product)
        db.session.commit()
        return jsonify({'message': 'Producto eliminado exitosamente'}), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'No se puede eliminar el producto porque está en uso'}), 400

@product_bp.route('/search/autocomplete', methods=['GET'])
def search_autocomplete():
    """Búsqueda de autocompletado para productos, categorías y marcas"""
    query = request.args.get('q', '').strip()
    
    if len(query) < 2:
        return jsonify({
            'products': [],
            'categories': [],
            'brands': []
        }), 200
    
    # Buscar productos (máximo 4)
    products = Product.query.filter(
        Product.is_active == True,
        db.or_(
            Product.name.ilike(f'%{query}%'),
            Product.description.ilike(f'%{query}%')
        )
    ).limit(4).all()
    
    # Buscar categorías que coincidan
    categories = Category.query.filter(
        Category.name.ilike(f'%{query}%')
    ).limit(2).all()
    
    # Buscar marcas que coincidan
    brands = Brand.query.filter(
        Brand.name.ilike(f'%{query}%')
    ).limit(2).all()
    
    return jsonify({
        'products': [product.serialize() for product in products],
        'categories': [category.serialize() for category in categories],
        'brands': [brand.serialize() for brand in brands]
    }), 200

@product_bp.route('/stats', methods=['GET'])
def get_product_stats():
    """Obtener estadísticas de productos para filtros dinámicos"""
    # Rango de precios
    price_stats = db.session.query(
        func.min(Product.price).label('min_price'),
        func.max(Product.price).label('max_price'),
        func.avg(Product.price).label('avg_price')
    ).filter(Product.is_active == True).first()
    
    # Productos por categoría
    category_stats = db.session.query(
        Category.name,
        func.count(Product.id).label('product_count')
    ).join(Product).filter(Product.is_active == True).group_by(Category.id, Category.name).all()
    
    # Productos por marca
    brand_stats = db.session.query(
        Brand.name,
        func.count(Product.id).label('product_count')
    ).join(Product).filter(Product.is_active == True).group_by(Brand.id, Brand.name).all()
    
    # Productos en stock vs sin stock
    stock_stats = db.session.query(
        func.sum(func.case([(Product.stock > 0, 1)], else_=0)).label('in_stock'),
        func.sum(func.case([(Product.stock == 0, 1)], else_=0)).label('out_of_stock')
    ).filter(Product.is_active == True).first()
    
    # Productos con descuento
    discount_stats = db.session.query(
        func.sum(func.case([(Product.discount_percentage > 0, 1)], else_=0)).label('with_discount'),
        func.sum(func.case([(Product.discount_percentage == 0, 1)], else_=0)).label('without_discount')
    ).filter(Product.is_active == True).first()
    
    # Promedio de ratings por producto
    avg_rating = db.session.query(
        func.avg(Review.rating).label('avg_rating'),
        func.count(Review.id).label('total_reviews')
    ).first()
    
    # Total de productos activos
    total_products = Product.query.filter(Product.is_active == True).count()
    
    return jsonify({
        'total_products': total_products,
        'price_range': {
            'min': float(price_stats.min_price or 0),
            'max': float(price_stats.max_price or 0),
            'average': float(price_stats.avg_price or 0)
        },
        'categories': [
            {
                'name': stat.name,
                'product_count': stat.product_count
            } for stat in category_stats
        ],
        'brands': [
            {
                'name': stat.name,
                'product_count': stat.product_count
            } for stat in brand_stats
        ],
        'stock_status': {
            'in_stock': int(stock_stats.in_stock or 0),
            'out_of_stock': int(stock_stats.out_of_stock or 0)
        },
        'discount_status': {
            'with_discount': int(discount_stats.with_discount or 0),
            'without_discount': int(discount_stats.without_discount or 0)
        },
        'rating_stats': {
            'average_rating': float(avg_rating.avg_rating or 0),
            'total_reviews': int(avg_rating.total_reviews or 0)
        }
    }), 200

# ==================== RUTAS DE CATEGORÍAS ====================

@product_bp.route('/categories', methods=['GET'])
def get_categories():
    """Obtener todas las categorías"""
    categories = Category.query.all()
    return jsonify([category.serialize() for category in categories]), 200

@product_bp.route('/categories/<int:category_id>', methods=['GET'])
def get_category(category_id):
    """Obtener una categoría específica por ID"""
    category = Category.query.get(category_id)
    if not category:
        return jsonify({'message': 'Categoría no encontrada'}), 404
    
    return jsonify(category.serialize()), 200

@product_bp.route('/categories', methods=['POST'])
@jwt_required()
def create_category():
    """Crear una nueva categoría (solo admin)"""
    current_user_id = get_jwt_identity()
    from app.models import User
    user = User.query.get(current_user_id)
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Acceso denegado. Se requieren permisos de administrador'}), 403
    
    data = request.get_json()
    
    if not data.get('name'):
        return jsonify({'message': 'El nombre de la categoría es requerido'}), 400
    
    try:
        new_category = Category()
        new_category.name = data['name']
        new_category.description = data.get('description', '')
        new_category.category_id = data.get('category_id', 1)  # Categoría padre por defecto
        
        db.session.add(new_category)
        db.session.commit()
        
        return jsonify({
            'message': 'Categoría creada exitosamente',
            'category': new_category.serialize()
        }), 201
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'El nombre de la categoría ya existe'}), 400

@product_bp.route('/categories/<int:category_id>', methods=['PUT'])
@jwt_required()
def update_category(category_id):
    """Actualizar una categoría existente (solo admin)"""
    current_user_id = get_jwt_identity()
    from app.models import User
    user = User.query.get(current_user_id)
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Acceso denegado. Se requieren permisos de administrador'}), 403
    
    category = Category.query.get(category_id)
    if not category:
        return jsonify({'message': 'Categoría no encontrada'}), 404
    
    data = request.get_json()
    
    try:
        if 'name' in data:
            category.name = data['name']
        if 'description' in data:
            category.description = data['description']
        if 'category_id' in data:
            category.category_id = data['category_id']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Categoría actualizada exitosamente',
            'category': category.serialize()
        }), 200
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'El nombre de la categoría ya existe'}), 400

@product_bp.route('/categories/<int:category_id>', methods=['DELETE'])
@jwt_required()
def delete_category(category_id):
    """Eliminar una categoría (solo admin)"""
    current_user_id = get_jwt_identity()
    from app.models import User
    user = User.query.get(current_user_id)
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Acceso denegado. Se requieren permisos de administrador'}), 403
    
    category = Category.query.get(category_id)
    if not category:
        return jsonify({'message': 'Categoría no encontrada'}), 404
    
    # Verificar si hay productos usando esta categoría
    products_count = Product.query.filter_by(category_id=category_id).count()
    if products_count > 0:
        return jsonify({'message': f'No se puede eliminar la categoría porque tiene {products_count} productos asociados'}), 400
    
    try:
        db.session.delete(category)
        db.session.commit()
        return jsonify({'message': 'Categoría eliminada exitosamente'}), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Error al eliminar la categoría'}), 400

# ==================== RUTAS DE MARCAS ====================

@product_bp.route('/brands', methods=['GET'])
def get_brands():
    """Obtener todas las marcas"""
    brands = Brand.query.all()
    return jsonify([brand.serialize() for brand in brands]), 200

@product_bp.route('/brands/<int:brand_id>', methods=['GET'])
def get_brand(brand_id):
    """Obtener una marca específica por ID"""
    brand = Brand.query.get(brand_id)
    if not brand:
        return jsonify({'message': 'Marca no encontrada'}), 404
    
    return jsonify(brand.serialize()), 200

@product_bp.route('/brands', methods=['POST'])
@jwt_required()
def create_brand():
    """Crear una nueva marca (solo admin)"""
    current_user_id = get_jwt_identity()
    from app.models import User
    user = User.query.get(current_user_id)
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Acceso denegado. Se requieren permisos de administrador'}), 403
    
    data = request.get_json()
    
    if not data.get('name'):
        return jsonify({'message': 'El nombre de la marca es requerido'}), 400
    
    try:
        new_brand = Brand()
        new_brand.name = data['name']
        new_brand.description = data.get('description', '')
        new_brand.logo_url = data.get('logo_url', '')
        new_brand.website = data.get('website', '')
        
        db.session.add(new_brand)
        db.session.commit()
        
        return jsonify({
            'message': 'Marca creada exitosamente',
            'brand': new_brand.serialize()
        }), 201
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'El nombre de la marca ya existe'}), 400

@product_bp.route('/brands/<int:brand_id>', methods=['PUT'])
@jwt_required()
def update_brand(brand_id):
    """Actualizar una marca existente (solo admin)"""
    current_user_id = get_jwt_identity()
    from app.models import User
    user = User.query.get(current_user_id)
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Acceso denegado. Se requieren permisos de administrador'}), 403
    
    brand = Brand.query.get(brand_id)
    if not brand:
        return jsonify({'message': 'Marca no encontrada'}), 404
    
    data = request.get_json()
    
    try:
        if 'name' in data:
            brand.name = data['name']
        if 'description' in data:
            brand.description = data['description']
        if 'logo_url' in data:
            brand.logo_url = data['logo_url']
        if 'website' in data:
            brand.website = data['website']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Marca actualizada exitosamente',
            'brand': brand.serialize()
        }), 200
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'El nombre de la marca ya existe'}), 400

@product_bp.route('/brands/<int:brand_id>', methods=['DELETE'])
@jwt_required()
def delete_brand(brand_id):
    """Eliminar una marca (solo admin)"""
    current_user_id = get_jwt_identity()
    from app.models import User
    user = User.query.get(current_user_id)
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Acceso denegado. Se requieren permisos de administrador'}), 403
    
    brand = Brand.query.get(brand_id)
    if not brand:
        return jsonify({'message': 'Marca no encontrada'}), 404
    
    # Verificar si hay productos usando esta marca
    products_count = Product.query.filter_by(brand_id=brand_id).count()
    if products_count > 0:
        return jsonify({'message': f'No se puede eliminar la marca porque tiene {products_count} productos asociados'}), 400
    
    try:
        db.session.delete(brand)
        db.session.commit()
        return jsonify({'message': 'Marca eliminada exitosamente'}), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Error al eliminar la marca'}), 400

# ==================== RUTAS DE REVIEWS ====================

@product_bp.route('/<int:product_id>/reviews', methods=['GET'])
def get_product_reviews(product_id):
    """Obtener todas las reviews de un producto"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    sort_by = request.args.get('sort_by', 'rating')  # rating, creation_date, helpful
    sort_order = request.args.get('sort_order', 'desc')  # asc, desc
    
    # Verificar que el producto existe
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'message': 'Producto no encontrado'}), 404
    
    query = Review.query.filter_by(product_id=product_id)
    
    # Aplicar ordenamiento
    if sort_by == 'rating':
        if sort_order == 'desc':
            query = query.order_by(Review.rating.desc(), Review.creation_date.desc())
        else:
            query = query.order_by(Review.rating.asc(), Review.creation_date.desc())
    elif sort_by == 'helpful':
        if sort_order == 'desc':
            query = query.order_by(Review.is_helpful.desc().nullslast(), Review.creation_date.desc())
        else:
            query = query.order_by(Review.is_helpful.asc().nullslast(), Review.creation_date.desc())
    else:  # creation_date por defecto
        if sort_order == 'desc':
            query = query.order_by(Review.creation_date.desc())
        else:
            query = query.order_by(Review.creation_date.asc())
    
    reviews = query.paginate(page=page, per_page=per_page, error_out=False)
    
    # Calcular estadísticas de reviews
    stats = db.session.query(
    func.avg(Review.rating).label('avg_rating'),
    func.count(Review.id).label('total_reviews')
).filter_by(product_id=product_id).first()
    
    # Calcular distribución de ratings manualmente
    all_reviews = Review.query.filter_by(product_id=product_id).all()
    rating_distribution = {
        '5_star': len([r for r in all_reviews if r.rating == 5]),
        '4_star': len([r for r in all_reviews if r.rating == 4]),
        '3_star': len([r for r in all_reviews if r.rating == 3]),
        '2_star': len([r for r in all_reviews if r.rating == 2]),
        '1_star': len([r for r in all_reviews if r.rating == 1])
    }
    
    return jsonify({
        'reviews': [review.serialize() for review in reviews.items],
        'total': reviews.total,
        'pages': reviews.pages,
        'current_page': page,
        'stats': {
            'average_rating': float(stats.avg_rating or 0),
            'total_reviews': int(stats.total_reviews or 0),
            'rating_distribution': rating_distribution
        }
    }), 200

@product_bp.route('/<int:product_id>/reviews', methods=['POST'])
@jwt_required()
def create_review(product_id):
    """Crear una nueva review para un producto"""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Verificar que el producto existe
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'message': 'Producto no encontrado'}), 404
    
    # Verificar que el usuario no haya ya hecho una review para este producto
    existing_review = Review.query.filter_by(user_id=current_user_id, product_id=product_id).first()
    if existing_review:
        return jsonify({'message': 'Ya has hecho una review para este producto'}), 400
    
    if not data.get('rating'):
        return jsonify({'message': 'El rating es requerido'}), 400
    
    rating = int(data['rating'])
    if rating < 1 or rating > 5:
        return jsonify({'message': 'El rating debe estar entre 1 y 5'}), 400
    
    try:
        new_review = Review()
        new_review.user_id = current_user_id
        new_review.product_id = product_id
        new_review.rating = rating
        new_review.title = data.get('title', '')
        new_review.comment = data.get('comment', '')
        
        # Verificar si el usuario ha comprado el producto (compra verificada)
        from app.models import Order, OrderItem
        verified_purchase = db.session.query(Order).join(OrderItem).filter(
            Order.user_id == current_user_id,
            OrderItem.product_id == product_id,
            Order.status.in_(['delivered', 'completed'])
        ).first()
        
        new_review.is_verified_purchase = verified_purchase is not None
        
        db.session.add(new_review)
        db.session.commit()
        
        return jsonify({
            'message': 'Review creada exitosamente',
            'review': new_review.serialize()
        }), 201
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Error al crear la review'}), 400

@product_bp.route('/reviews/<int:review_id>', methods=['PUT'])
@jwt_required()
def update_review(review_id):
    """Actualizar una review existente"""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    review = Review.query.filter_by(id=review_id, user_id=current_user_id).first()
    if not review:
        return jsonify({'message': 'Review no encontrada'}), 404
    
    try:
        if 'rating' in data:
            rating = int(data['rating'])
            if rating < 1 or rating > 5:
                return jsonify({'message': 'El rating debe estar entre 1 y 5'}), 400
            review.rating = rating
        
        if 'title' in data:
            review.title = data['title']
        
        if 'comment' in data:
            review.comment = data['comment']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Review actualizada exitosamente',
            'review': review.serialize()
        }), 200
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Error al actualizar la review'}), 400

@product_bp.route('/reviews/<int:review_id>', methods=['DELETE'])
@jwt_required()
def delete_review(review_id):
    """Eliminar una review"""
    current_user_id = get_jwt_identity()
    
    review = Review.query.filter_by(id=review_id, user_id=current_user_id).first()
    if not review:
        return jsonify({'message': 'Review no encontrada'}), 404
    
    try:
        db.session.delete(review)
        db.session.commit()
        
        return jsonify({'message': 'Review eliminada exitosamente'}), 200
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Error al eliminar la review'}), 400

@product_bp.route('/reviews/<int:review_id>/helpful', methods=['POST'])
@jwt_required()
def mark_review_helpful(review_id):
    """Marcar/desmarcar una review como útil (toggle)"""
    current_user_id = get_jwt_identity()
    
    review = Review.query.get(review_id)
    if not review:
        return jsonify({'message': 'Review no encontrada'}), 404
    
    # Verificar que el usuario no está marcando su propia review como útil
    if review.user_id == current_user_id:
        return jsonify({'message': 'You cannot mark your own review as helpful'}), 400
    
    try:
        # Buscar si el usuario ya dio like a esta review
        existing_like = ReviewLike.query.filter_by(
            user_id=current_user_id, 
            review_id=review_id
        ).first()
        
        if existing_like:
            # Si ya dio like, quitarlo (unlike)
            db.session.delete(existing_like)
            review.is_helpful = max(0, review.is_helpful - 1)  # No permitir valores negativos
            action = 'unliked'
        else:
            # Si no dio like, agregarlo (like)
            new_like = ReviewLike()
            new_like.user_id = current_user_id
            new_like.review_id = review_id
            db.session.add(new_like)
            review.is_helpful += 1
            action = 'liked'
        
        db.session.commit()
        
        return jsonify({
            'message': f'Review {action} successfully',
            'helpful_count': review.is_helpful,
            'action': action
        }), 200
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Error processing like'}), 400

@product_bp.route('/reviews/user/liked', methods=['GET'])
@jwt_required()
def get_user_liked_reviews():
    """Obtener las reviews que el usuario actual ha marcado como útiles"""
    current_user_id = get_jwt_identity()
    
    # Obtener todas las reviews que el usuario ha likeado
    liked_reviews = ReviewLike.query.filter_by(user_id=current_user_id).all()
    
    # Extraer solo los IDs de las reviews likeadas
    liked_review_ids = [like.review_id for like in liked_reviews]
    
    return jsonify({
        'liked_review_ids': liked_review_ids
    }), 200

@product_bp.route('/reviews/user/<int:user_id>', methods=['GET'])
def get_user_reviews(user_id):
    """Obtener todas las reviews de un usuario específico"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    reviews = Review.query.filter_by(user_id=user_id).order_by(Review.creation_date.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'reviews': [review.serialize() for review in reviews.items],
        'total': reviews.total,
        'pages': reviews.pages,
        'current_page': page
    }), 200

@product_bp.route('/<int:product_id>/reviews/helpful', methods=['GET'])
def get_helpful_reviews(product_id):
    """Obtener las reviews más útiles de un producto"""
    limit = request.args.get('limit', 5, type=int)
    
    # Verificar que el producto existe
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'message': 'Producto no encontrado'}), 404
    
    # Obtener las reviews más útiles
    helpful_reviews = Review.query.filter_by(product_id=product_id).order_by(
        Review.is_helpful.desc(), 
        Review.rating.desc(), 
        Review.creation_date.desc()
    ).limit(limit).all()
    
    return jsonify([review.serialize() for review in helpful_reviews]), 200

# ==================== RUTAS DE DESCUENTOS ====================

@product_bp.route('/discounts', methods=['GET'])
def get_discounts():
    """Obtener todos los descuentos activos"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    active_only = request.args.get('active_only', True, type=bool)
    
    query = Discount.query
    
    if active_only:
        query = query.filter(Discount.is_active == True)
    
    discounts = query.order_by(Discount.creation_date.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'discounts': [discount.serialize() for discount in discounts.items],
        'total': discounts.total,
        'pages': discounts.pages,
        'current_page': page
    }), 200

@product_bp.route('/discounts/<int:discount_id>', methods=['GET'])
def get_discount(discount_id):
    """Obtener un descuento específico"""
    discount = Discount.query.get(discount_id)
    if not discount:
        return jsonify({'message': 'Descuento no encontrado'}), 404
    
    return jsonify(discount.serialize()), 200

@product_bp.route('/discounts', methods=['POST'])
@jwt_required()
def create_discount():
    """Crear un nuevo descuento (solo admin)"""
    current_user_id = get_jwt_identity()
    from app.models import User
    user = User.query.get(current_user_id)
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Acceso denegado. Se requieren permisos de administrador'}), 403
    
    data = request.get_json()
    
    required_fields = ['name', 'discount_percentage', 'start_date', 'end_date']
    if not all(field in data and data[field] for field in required_fields):
        return jsonify({'message': 'name, discount_percentage, start_date y end_date son requeridos'}), 400
    
    try:
        from datetime import datetime
        
        new_discount = Discount()
        new_discount.name = data['name']
        new_discount.description = data.get('description', '')
        new_discount.discount_percentage = float(data['discount_percentage'])
        new_discount.start_date = datetime.fromisoformat(data['start_date'].replace('Z', '+00:00'))
        new_discount.end_date = datetime.fromisoformat(data['end_date'].replace('Z', '+00:00'))
        new_discount.is_active = data.get('is_active', True)
        
        # Relaciones opcionales
        if data.get('category_id'):
            new_discount.category_id = data['category_id']
        if data.get('brand_id'):
            new_discount.brand_id = data['brand_id']
        if data.get('product_id'):
            new_discount.product_id = data['product_id']
        
        db.session.add(new_discount)
        db.session.commit()
        
        return jsonify({
            'message': 'Descuento creado exitosamente',
            'discount': new_discount.serialize()
        }), 201
        
    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Error al crear el descuento'}), 400

@product_bp.route('/discounts/<int:discount_id>', methods=['PUT'])
@jwt_required()
def update_discount(discount_id):
    """Actualizar un descuento existente (solo admin)"""
    current_user_id = get_jwt_identity()
    from app.models import User
    user = User.query.get(current_user_id)
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Acceso denegado. Se requieren permisos de administrador'}), 403
    
    discount = Discount.query.get(discount_id)
    if not discount:
        return jsonify({'message': 'Descuento no encontrado'}), 404
    
    data = request.get_json()
    
    try:
        if 'name' in data:
            discount.name = data['name']
        if 'description' in data:
            discount.description = data['description']
        if 'discount_percentage' in data:
            discount.discount_percentage = float(data['discount_percentage'])
        if 'start_date' in data:
            from datetime import datetime
            discount.start_date = datetime.fromisoformat(data['start_date'].replace('Z', '+00:00'))
        if 'end_date' in data:
            from datetime import datetime
            discount.end_date = datetime.fromisoformat(data['end_date'].replace('Z', '+00:00'))
        if 'is_active' in data:
            discount.is_active = data['is_active']
        
        # Relaciones opcionales
        if 'category_id' in data:
            discount.category_id = data['category_id']
        if 'brand_id' in data:
            discount.brand_id = data['brand_id']
        if 'product_id' in data:
            discount.product_id = data['product_id']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Descuento actualizado exitosamente',
            'discount': discount.serialize()
        }), 200
        
    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Error al actualizar el descuento'}), 400

@product_bp.route('/discounts/<int:discount_id>', methods=['DELETE'])
@jwt_required()
def delete_discount(discount_id):
    """Eliminar un descuento (solo admin)"""
    current_user_id = get_jwt_identity()
    from app.models import User
    user = User.query.get(current_user_id)
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Acceso denegado. Se requieren permisos de administrador'}), 403
    
    discount = Discount.query.get(discount_id)
    if not discount:
        return jsonify({'message': 'Descuento no encontrado'}), 404
    
    try:
        db.session.delete(discount)
        db.session.commit()
        return jsonify({'message': 'Descuento eliminado exitosamente'}), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Error al eliminar el descuento'}), 400

@product_bp.route('/discounts/active', methods=['GET'])
def get_active_discounts():
    """Obtener todos los descuentos actualmente activos"""
    from datetime import datetime
    now = datetime.utcnow()
    
    active_discounts = Discount.query.filter(
        Discount.is_active == True,
        Discount.start_date <= now,
        Discount.end_date >= now
    ).all()
    
    return jsonify([discount.serialize() for discount in active_discounts]), 200

@product_bp.route('/discounts/apply/<int:product_id>', methods=['GET'])
def get_product_discounts(product_id):
    """Obtener descuentos aplicables a un producto específico"""
    from datetime import datetime
    now = datetime.utcnow()
    
    # Verificar que el producto existe
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'message': 'Producto no encontrado'}), 404
    
    # Buscar descuentos aplicables
    applicable_discounts = Discount.query.filter(
        Discount.is_active == True,
        Discount.start_date <= now,
        Discount.end_date >= now,
        db.or_(
            Discount.product_id == product_id,
            Discount.category_id == product.category_id,
            Discount.brand_id == product.brand_id,
            db.and_(Discount.product_id.is_(None), Discount.category_id.is_(None), Discount.brand_id.is_(None))  # Descuentos globales
        )
    ).all()
    
    return jsonify([discount.serialize() for discount in applicable_discounts]), 200

@product_bp.route('/top-discounts-by-category', methods=['GET'])
def get_top_discounts_by_category():
    """Obtener el producto con mayor descuento por categoría"""
    try:
        # Obtener todas las categorías activas
        categories = Category.query.all()
        result = []
        
        for category in categories:
            # Buscar el producto con mayor descuento en esta categoría
            top_discount_product = Product.query.filter(
                Product.category_id == category.id,
                Product.is_active == True,
                Product.discount_percentage > 0,
                Product.stock > 0  # Solo productos en stock
            ).order_by(Product.discount_percentage.desc()).first()
            
            if top_discount_product:
                result.append({
                    'category': category.serialize(),
                    'product': top_discount_product.serialize()
                })
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'message': f'Error al obtener productos con descuento: {str(e)}'}), 500 