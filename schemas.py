from pydantic import BaseModel, Field

# Esquema de envio
class ClienteInput(BaseModel):
    id_cliente: str = Field(min_length=2, max_length=50, description="Nombre del solicitante")
    edad: int = Field(description="Edad")
    ingresos_anuales: int = Field(description="¿Ingresos anuales?")
    salario_mensual_aprox: int = Field(description="¿Salario mensual?")
    antiguedad_meses: int = Field(description="¿Antiguedad en meses?")
    saldo_cuenta: bool = Field(default=False, description="¿Saldo de la cuenta?")
    nivel_estudios: str = Field(min_length=2, max_length=50, description="Nivel de estudios")
    tipo_cuenta: str = Field(min_length=2, max_length=50, description="Tipo de cuenta")
    nivel_satisfaccion: str = Field(min_length=2, max_length=50, description="Nivel de satisfacion")
    num_productos: int = Field(description="Numero de productos")
    tiene_tarjeta: bool = Field(default=False, description="¿Tiene tarjeta")
    canal_preferido: str = Field(min_length=2, max_length=50, description="Canal preferido")
    comentarios_cliente: str = Field(min_length=2, max_length=50, description="Comentarios del cliente")

# Esquema de respuesta
class PrediccionOutput(BaseModel):
    id_cliente:str
    abandono:int
    probabilidad_abandono:float
    nivel_riesgo:str
    accion_recomendada:str
