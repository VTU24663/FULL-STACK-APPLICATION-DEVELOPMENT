import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;
import java.sql.*;

public class OrderServlet extends HttpServlet {

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            Connection con = DriverManager.getConnection(
                    "jdbc:mysql://localhost:3306/student_db", "root", "password");

            PrintWriter out = response.getWriter();
            out.println("<html><body>");

            // 🔹 JOIN Query (Customer Order History)
            out.println("<h3>Order History</h3>");
            Statement st = con.createStatement();

            ResultSet rs = st.executeQuery(
                "SELECT c.name, p.product_name, o.quantity, p.price, (o.quantity * p.price) AS total " +
                "FROM orders o " +
                "JOIN customers c ON o.customer_id = c.customer_id " +
                "JOIN products p ON o.product_id = p.product_id " +
                "ORDER BY total DESC"
            );

            out.println("<table>");
            out.println("<tr><th>Customer</th><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr>");

            while (rs.next()) {
                out.println("<tr>");
                out.println("<td>" + rs.getString("name") + "</td>");
                out.println("<td>" + rs.getString("product_name") + "</td>");
                out.println("<td>" + rs.getInt("quantity") + "</td>");
                out.println("<td>" + rs.getDouble("price") + "</td>");
                out.println("<td>" + rs.getDouble("total") + "</td>");
                out.println("</tr>");
            }

            out.println("</table>");

            // 🔹 Subquery: Highest Value Order
            out.println("<h3>Highest Value Order</h3>");

            ResultSet maxOrder = st.executeQuery(
                "SELECT MAX(quantity * p.price) AS max_value " +
                "FROM orders o JOIN products p ON o.product_id = p.product_id"
            );

            if (maxOrder.next()) {
                out.println("Highest Order Value: " + maxOrder.getDouble("max_value"));
            }

            // 🔹 Subquery: Most Active Customer
            out.println("<h3>Most Active Customer</h3>");

            ResultSet active = st.executeQuery(
                "SELECT c.name, COUNT(o.order_id) AS total_orders " +
                "FROM customers c JOIN orders o ON c.customer_id = o.customer_id " +
                "GROUP BY c.name " +
                "ORDER BY total_orders DESC LIMIT 1"
            );

            if (active.next()) {
                out.println("Customer: " + active.getString("name") +
                            " (Orders: " + active.getInt("total_orders") + ")");
            }

            out.println("</body></html>");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}